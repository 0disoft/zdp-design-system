import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { zdpBrandAssets, type ZdpBrandAsset } from '../src/lib/brand-assets';
import {
  brandOutputContract,
  brandOutputRoot,
  brandSourceContract,
  forbiddenBrandAssetSha256,
  repoRoot
} from './brand-asset-contract';

const failures: string[] = [];
const expectedDetailedShipPaths = [
  'M23 8v20H12c1.5-7.8 5-14.1 11-20Z',
  'M26 6v22h13C36.9 18.2 32.8 11.5 26 6Z',
  'M24 7v24',
  'M8 31h32l-4.6 7H13.8L8 31Z',
  'M12 41c3 1.6 6 1.6 9 0s6-1.6 9 0 5.5 1.5 8 0'
] as const;
const expectedSimpleShipPaths = [
  'M10 29 21 14v15Z',
  'M25 8v21h15Z',
  'M7 33h34l-4.5 7h-25Z'
] as const;

await checkOutputs();
await checkForbiddenAsset();
await checkPackageExclusions();

if (failures.length > 0) {
  throw new Error(`Brand asset check failed:\n- ${failures.join('\n- ')}`);
}

console.log('Brand asset contract passed.');

async function checkOutputs(): Promise<void> {
  const expectedNames = brandOutputContract.map((entry) => entry.fileName).sort();
  const actualNames = (await readdir(brandOutputRoot)).sort();

  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    failures.push(`Published asset allowlist mismatch: expected ${expectedNames.join(', ')}, received ${actualNames.join(', ')}.`);
  }

  const manifestAssets = flattenManifest();
  const manifestByFile = new Map(manifestAssets.map((asset) => [asset.packagePath.split('/').at(-1), asset]));

  for (const output of brandOutputContract) {
    const path = resolve(brandOutputRoot, output.fileName);
    const bytes = await readFile(path);
    const fileStat = await stat(path);
    const manifest = manifestByFile.get(output.fileName);

    if (fileStat.size > output.maxBytes) {
      failures.push(`${output.fileName} is ${fileStat.size} bytes; budget is ${output.maxBytes} bytes.`);
    }

    if (!manifest) {
      failures.push(`${output.fileName} is missing from zdpBrandAssets.`);
      continue;
    }

    assertHash(output.fileName, bytes, manifest.sha256);
    assertManifestMetadata(output.fileName, manifest, output);

    if (output.format === 'svg') {
      checkShipSvg(output.fileName, bytes.toString('utf8'));
      continue;
    }

    const metadata = readRasterMetadata(bytes, extname(output.fileName));
    assertDimensions(output.fileName, metadata.width, metadata.height, output.width, output.height);

    if (metadata.format !== output.format) {
      failures.push(`${output.fileName} must be ${output.format}, received ${metadata.format}.`);
    }
  }
}

async function checkForbiddenAsset(): Promise<void> {
  for (const name of await readdir(brandOutputRoot)) {
    const path = resolve(brandOutputRoot, name);
    const fileStat = await stat(path);
    if (!fileStat.isFile()) continue;
    const bytes = await readFile(path);
    if (sha256(bytes) === forbiddenBrandAssetSha256) {
      failures.push(`${name} matches the forbidden distorted-logo image.`);
    }
  }
}

async function checkPackageExclusions(): Promise<void> {
  const packageJson = JSON.parse(await readFile(resolve(repoRoot, 'package.json'), 'utf8')) as { files?: string[] };
  if (packageJson.files?.some((entry) => entry.startsWith('assets'))) {
    failures.push('package.json files must not expose assets/source; derived assets ship only through dist/.');
  }

  if (existsSync(resolve(repoRoot, 'assets/source/brand'))) {
    failures.push('Large brand source PNGs must stay outside the design-system repository.');
  }

  const distRoot = resolve(repoRoot, 'dist');
  try {
    const files = await readdir(distRoot, { recursive: true });
    for (const file of files) {
      if (/\.(png)$/i.test(file) || Object.values(brandSourceContract).some((source) => file.endsWith(source.fileName))) {
        failures.push(`dist must not contain source image ${file}.`);
      }
    }
  } catch {
    // package:build owns dist creation; absence is valid for the source-only check.
  }
}

function flattenManifest(): readonly ZdpBrandAsset[] {
  return Object.values(zdpBrandAssets).flatMap((entry) => Array.isArray(entry) ? [...entry] : [entry]) as ZdpBrandAsset[];
}

function assertHash(fileName: string, bytes: Uint8Array, expected: string): void {
  const actual = sha256(bytes);
  if (actual !== expected) failures.push(`${fileName} SHA-256 mismatch: expected ${expected}, received ${actual}.`);
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function assertDimensions(fileName: string, width: number, height: number, expectedWidth: number, expectedHeight: number): void {
  if (width !== expectedWidth || height !== expectedHeight) {
    failures.push(`${fileName} must be ${expectedWidth}x${expectedHeight}, received ${width}x${height}.`);
  }
}

function assertManifestMetadata(
  fileName: string,
  manifest: ZdpBrandAsset,
  output: (typeof brandOutputContract)[number]
): void {
  if (manifest.width !== output.width || manifest.height !== output.height || manifest.format !== output.format) {
    failures.push(`${fileName} manifest dimensions or format do not match the published file contract.`);
  }
  if (!manifest.packagePath.startsWith('zdp-design-system/assets/brand/')) {
    failures.push(`${fileName} manifest path must use the public package asset subpath.`);
  }
  if (manifest.cropPolicy === undefined || manifest.decorative === undefined || manifest.themeSuitability.length === 0 || manifest.intendedUse.length === 0) {
    failures.push(`${fileName} manifest must declare crop, decorative, theme, and intended-use metadata.`);
  }
}

function checkShipSvg(fileName: string, source: string): void {
  const paths = [...source.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]);
  const expectedPaths = fileName === 'ship-mark.svg' ? expectedDetailedShipPaths : expectedSimpleShipPaths;

  if (JSON.stringify(paths) !== JSON.stringify(expectedPaths)) {
    failures.push(`${fileName} must preserve its official ship-mark paths exactly and in order.`);
  }
  if (!source.includes('viewBox="0 0 48 48"')) failures.push(`${fileName} must preserve the official 48x48 viewBox.`);
  if (/<text\b|<image\b|href=|xlink:href=/i.test(source)) {
    failures.push(`${fileName} must not embed text, raster images, or external references.`);
  }

  if (fileName === 'ship-mark.svg') return;

  if (/<rect\b|<circle\b|<ellipse\b|<polygon\b|<polyline\b|\sstroke=/i.test(source)) {
    failures.push(`${fileName} must not embed backgrounds, alternate geometry elements, or strokes.`);
  }

  if (paths.length !== 3) failures.push(`${fileName} must contain exactly three geometric paths.`);

  const expectedFill = {
    'ship-mark-simple-mono.svg': '<g fill="#2f2418">',
    'ship-mark-simple-inverse.svg': '<g fill="#fff8ea">',
    'ship-mark-simple-current-color.svg': '<g fill="currentColor">'
  }[fileName];

  if (expectedFill && !source.includes(expectedFill)) {
    failures.push(`${fileName} must preserve its declared single-color fill contract.`);
  }

  if (fileName === 'ship-mark-simple-tricolor.svg') {
    for (const requiredPath of [
      '<path fill="#b66a24" d="M10 29 21 14v15Z" />',
      '<path fill="#b89a6a" d="M25 8v21h15Z" />',
      '<path fill="#2f2418" d="M7 33h34l-4.5 7h-25Z" />'
    ]) {
      if (!source.includes(requiredPath)) failures.push(`${fileName} must preserve tricolor path ${requiredPath}.`);
    }
  }
}

function readRasterMetadata(bytes: Buffer, extension: string): { format: 'png' | 'jpeg' | 'webp'; width: number; height: number } {
  if (extension === '.png') {
    if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error('Invalid PNG signature.');
    return { format: 'png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (extension === '.jpg' || extension === '.jpeg') return readJpegMetadata(bytes);
  if (extension === '.webp') return readWebpMetadata(bytes);
  throw new Error(`Unsupported raster extension ${extension}.`);
}

function readJpegMetadata(bytes: Buffer): { format: 'jpeg'; width: number; height: number } {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Invalid JPEG signature.');
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes.readUInt8(offset + 1);
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { format: 'jpeg', height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error('JPEG dimensions were not found.');
}

function readWebpMetadata(bytes: Buffer): { format: 'webp'; width: number; height: number } {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Invalid WebP signature.');
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { format: 'webp', width: readUInt24LE(bytes, 24) + 1, height: readUInt24LE(bytes, 27) + 1 };
  if (chunk === 'VP8 ') return { format: 'webp', width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { format: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`Unsupported WebP chunk ${chunk}.`);
}

function readUInt24LE(bytes: Buffer, offset: number): number {
  return bytes.readUInt8(offset) | (bytes.readUInt8(offset + 1) << 8) | (bytes.readUInt8(offset + 2) << 16);
}
