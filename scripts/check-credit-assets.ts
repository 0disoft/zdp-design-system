import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { zdpCreditAssets, type ZdpCreditAsset } from '../src/lib/credit-assets';
import { creditAssetContract, creditAssetOutputRoot } from './credit-asset-contract';

const failures: string[] = [];

await checkCreditAssets();

if (failures.length > 0) {
  throw new Error(`Credit asset check failed:\n- ${failures.join('\n- ')}`);
}

console.log('Credit asset contract passed.');

async function checkCreditAssets(): Promise<void> {
  const expectedNames = creditAssetContract.map((entry) => entry.fileName).sort();
  const actualNames = (await readdir(creditAssetOutputRoot)).sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    failures.push(`Published credit asset allowlist mismatch: expected ${expectedNames.join(', ')}, received ${actualNames.join(', ')}.`);
  }

  const manifestByFile = new Map(flattenManifest().map((asset) => [asset.packagePath.split('/').at(-1), asset]));

  for (const contract of creditAssetContract) {
    const path = resolve(creditAssetOutputRoot, contract.fileName);
    const bytes = await readFile(path);
    const fileStat = await stat(path);
    const manifest = manifestByFile.get(contract.fileName);

    if (fileStat.size > contract.maxBytes) failures.push(`${contract.fileName} exceeds its ${contract.maxBytes}-byte budget.`);
    if (!manifest) {
      failures.push(`${contract.fileName} is missing from zdpCreditAssets.`);
      continue;
    }

    if (sha256(bytes) !== manifest.sha256) failures.push(`${contract.fileName} SHA-256 does not match zdpCreditAssets.`);
    if (manifest.width !== contract.width || manifest.height !== contract.height || manifest.format !== contract.format || manifest.aspectRatio !== contract.aspectRatio) {
      failures.push(`${contract.fileName} manifest format, dimensions, or aspect ratio do not match its asset contract.`);
    }
    if (manifest.kind !== contract.kind || manifest.packId !== contract.packId) {
      failures.push(`${contract.fileName} manifest kind or packId does not match its asset contract.`);
    }
    if (!manifest.packagePath.startsWith('zdp-design-system/assets/credits/')) {
      failures.push(`${contract.fileName} must use the public credits package subpath.`);
    }
    if (manifest.minimumCssPixels !== contract.minimumCssPixels || manifest.themeSuitability.length === 0 || manifest.intendedUse.length === 0) {
      failures.push(`${contract.fileName} must declare minimum size, theme, and intended-use metadata.`);
    }

    if (contract.format === 'webp') {
      const dimensions = readWebpDimensions(bytes);
      if (dimensions.width !== contract.width || dimensions.height !== contract.height) {
        failures.push(`${contract.fileName} must be ${contract.width}x${contract.height}, received ${dimensions.width}x${dimensions.height}.`);
      }
      continue;
    }

    const source = bytes.toString('utf8');
    const paths = [...source.matchAll(/\sd="([^"]+)"/g)];
    if (paths.length !== contract.pathCount) failures.push(`${contract.fileName} must contain exactly ${contract.pathCount} path elements.`);
    if (!source.includes(`viewBox="${contract.viewBox}"`)) failures.push(`${contract.fileName} must preserve viewBox ${contract.viewBox}.`);
    if (/<script\b|<style\b|<text\b|<image\b|<foreignObject\b|href=|xlink:href=|\son[a-z]+=/i.test(source)) {
      failures.push(`${contract.fileName} must not embed scripts, styles, text, raster images, event handlers, or external references.`);
    }
    if (/<rect\b|<circle\b|<ellipse\b|<polygon\b|<polyline\b/i.test(source) || (!contract.allowStroke && /\sstroke=/i.test(source))) {
      failures.push(`${contract.fileName} contains geometry or stroke attributes outside its asset contract.`);
    }
    if (contract.fill !== 'multi' && !source.includes(`<g fill="${contract.fill}">`)) {
      failures.push(`${contract.fileName} must preserve its ${contract.fill} group fill.`);
    }
  }
}

function flattenManifest(): readonly ZdpCreditAsset[] {
  return [...zdpCreditAssets.tangerine, ...zdpCreditAssets.packs, ...zdpCreditAssets.keyart];
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function readWebpDimensions(bytes: Buffer): { width: number; height: number } {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Invalid WebP signature.');
  }
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: readUInt24LE(bytes, 24) + 1, height: readUInt24LE(bytes, 27) + 1 };
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`Unsupported WebP chunk ${chunk}.`);
}

function readUInt24LE(bytes: Buffer, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}
