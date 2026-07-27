import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { brandOutputRoot, brandSourceContract, repoRoot } from './brand-asset-contract';

const ffmpeg = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
const brandSourceRoot = parseSourceRoot(process.argv.slice(2));

await mkdir(brandOutputRoot, { recursive: true });
await verifySources();

runFfmpeg([
  '-i', sourcePath('og'), '-vf', 'scale=1200:630:flags=lanczos,format=yuvj420p',
  '-frames:v', '1', '-q:v', '4', ...srgbOutputArgs(), '-map_metadata', '-1', outputPath('og-background-1200x630.jpg')
]);

await generateSquareAssets();

for (const [width, height] of [[1440, 1080], [720, 540]] as const) {
  runFfmpeg([
    '-i', sourcePath('editorial'), '-vf', `scale=${width}:${height}:flags=lanczos,format=rgb24`,
    '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', '-compression_level', '6', ...srgbOutputArgs(), '-map_metadata', '-1', outputPath(`editorial-${width}x${height}.webp`)
  ]);
}

for (const [width, height] of [[1600, 900], [960, 540], [640, 360]] as const) {
  runFfmpeg([
    '-i', sourcePath('landscape'), '-vf', `scale=${width}:${height}:flags=lanczos,format=rgb24`,
    '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', '-compression_level', '6', ...srgbOutputArgs(), '-map_metadata', '-1', outputPath(`landscape-${width}x${height}.webp`)
  ]);
}

console.log('Brand asset derivatives generated. Run brand-assets:check and review the images before committing.');

async function verifySources(): Promise<void> {
  for (const source of Object.values(brandSourceContract)) {
    const bytes = await readFile(resolve(brandSourceRoot, source.fileName));
    const actualSha256 = createHash('sha256').update(bytes).digest('hex');

    if (actualSha256 !== source.sha256) {
      throw new Error(`${source.fileName} SHA-256 mismatch: expected ${source.sha256}, received ${actualSha256}.`);
    }
  }
}

function sourcePath(key: keyof typeof brandSourceContract): string {
  return resolve(brandSourceRoot, brandSourceContract[key].fileName);
}

function parseSourceRoot(args: readonly string[]): string {
  const sourceDirIndex = args.indexOf('--source-dir');
  const sourceDir = sourceDirIndex >= 0 ? args[sourceDirIndex + 1] : undefined;

  if (!sourceDir || args.length !== 2 || sourceDirIndex !== 0) {
    throw new Error('Usage: bun scripts/generate-brand-assets.ts --source-dir <directory-containing-the-four-verified-png-files>');
  }

  return resolve(sourceDir);
}

function outputPath(fileName: string): string {
  return resolve(brandOutputRoot, fileName);
}

async function generateSquareAssets(): Promise<void> {
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'zdp-brand-assets-'));

  try {
    for (const size of [1024, 512, 256] as const) {
      const markSize = Math.round(size * 0.4);
      const markPath = resolve(temporaryRoot, `ship-mark-${markSize}.png`);
      runNode([
        resolve(repoRoot, 'scripts/browser/render-brand-mark.mjs'),
        outputPath('ship-mark.svg'),
        markPath,
        String(markSize)
      ]);

      runFfmpeg([
        '-i', sourcePath('square'), '-i', markPath,
        '-filter_complex', `[0:v]scale=${size}:${size}:flags=lanczos[bg];[bg][1:v]overlay=(W-w)/2:(H-h)/2:format=auto,format=rgb24`,
        '-frames:v', '1', '-c:v', 'libwebp', '-quality', '84', '-compression_level', '6', ...srgbOutputArgs(), '-map_metadata', '-1', outputPath(`brand-square-${size}.webp`)
      ]);
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function runNode(args: readonly string[]): void {
  const node = process.platform === 'win32' ? 'node.exe' : 'node';
  const result = spawnSync(node, args, { cwd: repoRoot, encoding: 'utf8', shell: false });
  if (result.error) throw new Error(`Unable to run Node ship-mark renderer: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Ship-mark renderer failed (${result.status}): ${(result.stderr || result.stdout).trim()}`);
}

function srgbOutputArgs(): readonly string[] {
  return ['-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-colorspace', 'bt709'];
}

function runFfmpeg(args: readonly string[]): void {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    cwd: brandOutputRoot,
    encoding: 'utf8',
    shell: false
  });

  if (result.error) {
    throw new Error(`Unable to run FFmpeg. Install FFmpeg 8 or newer for maintainer-only asset generation: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`FFmpeg failed (${result.status}): ${(result.stderr || result.stdout).trim()}`);
  }
}
