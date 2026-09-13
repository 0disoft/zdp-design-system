import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync
} from 'node:zlib';
import type { PackageMeasurement, PackageSizeMetrics } from './model.ts';
import { readTarEntries, stripPackagePrefix } from './tar.ts';

interface PackageManifest {
  readonly name?: unknown;
  readonly version?: unknown;
}

interface PackResult {
  readonly filename?: unknown;
  readonly [key: string]: unknown;
}

const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const javascriptPattern = /\.(?:c|m)?js$/i;

export async function packPackage(cwd: string, destination: string, spec: string | null): Promise<string> {
  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['pack'];
  if (spec !== null) args.push(spec);
  args.push('--json', '--ignore-scripts', '--pack-destination', destination);

  const result = spawnSync(npmExecutable, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_fetch_retries: '1',
      npm_config_fetch_retry_mintimeout: '1000',
      npm_config_fetch_retry_maxtimeout: '5000',
      npm_config_fetch_timeout: '15000'
    },
    maxBuffer: 10 * 1024 * 1024,
    shell: false,
    timeout: spec === null ? 60_000 : 30_000
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'npm pack failed').trim());
  }

  const results = parseNpmPackResults(result.stdout);
  assert.equal(results.length, 1, `npm pack must create exactly one tarball, received ${results.length}.`);
  const packed = results[0];
  if (!packed) throw new Error('npm pack did not return a result.');
  if (typeof packed.filename !== 'string') throw new Error('npm pack did not return a tarball filename.');
  assert.equal(basename(packed.filename), packed.filename, 'npm pack returned an unsafe filename.');

  const tarball = resolve(destination, packed.filename);
  assert.equal(relative(resolve(destination), tarball), packed.filename, 'npm pack escaped the destination directory.');
  const tarballStat = await stat(tarball);
  assert.ok(tarballStat.isFile(), 'npm pack result is not a file.');
  return tarball;
}

export async function measureTarball(tarball: string, source: string): Promise<PackageMeasurement> {
  const archive = await readFile(tarball);
  const entries = readTarEntries(archive);
  assert.ok(entries.every((entry) => entry.path.startsWith('package/')), 'npm package entries must stay under package/.');
  const manifestEntry = entries.find((entry) => entry.path === 'package/package.json');
  if (!manifestEntry) throw new Error('Packed package.json is missing.');
  const manifest = JSON.parse(manifestEntry.content.toString('utf8')) as PackageManifest;
  if (typeof manifest.name !== 'string') throw new Error('Packed package name is missing.');
  if (typeof manifest.version !== 'string') throw new Error('Packed package version is missing.');

  const files = entries.map((entry) => ({
    path: stripPackagePrefix(entry.path),
    content: entry.content
  }));
  const javascriptFiles = files.filter(
    (file) => file.path.startsWith('dist/') && javascriptPattern.test(file.path)
  );
  const cssFiles = files.filter(
    (file) => file.path.startsWith('dist/') && file.path.endsWith('.css')
  );
  const imageFiles = files.filter(
    (file) => file.path.startsWith('dist/assets/') && imagePattern.test(file.path)
  );
  const largestFiles = files
    .map((file) => ({ path: file.path, bytes: file.content.byteLength }))
    .sort((left, right) => right.bytes - left.bytes || left.path.localeCompare(right.path))
    .slice(0, 8);

  const metrics: PackageSizeMetrics = {
    tarballBytes: archive.byteLength,
    unpackedBytes: sum(files.map((file) => file.content.byteLength)),
    javascriptGzipBytes: sum(
      javascriptFiles.map((file) => gzipSync(file.content, { level: 9 }).byteLength)
    ),
    cssBrotliBytes: sum(cssFiles.map((file) => brotliCompressSync(file.content, {
      params: {
        [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
        [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
        [zlibConstants.BROTLI_PARAM_SIZE_HINT]: file.content.byteLength
      }
    }).byteLength)),
    imageAssetBytes: sum(imageFiles.map((file) => file.content.byteLength)),
    largestImageAssetBytes: imageFiles.reduce(
      (largest, file) => Math.max(largest, file.content.byteLength),
      0
    ),
    fileCount: files.length
  };

  return {
    packageName: manifest.name,
    packageVersion: manifest.version,
    source,
    metrics,
    largestFiles
  };
}

function parseNpmPackResults(stdout: string): PackResult[] {
  const parsed: unknown = JSON.parse(stdout);
  if (Array.isArray(parsed)) return parsed.filter(isRecord);
  if (isRecord(parsed)) return Object.values(parsed).filter(isRecord);
  return [];
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
