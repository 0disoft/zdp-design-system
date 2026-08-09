import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZdpCreditPackId } from '../src/lib/credit-assets';

export const creditAssetRepoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const creditAssetOutputRoot = resolve(creditAssetRepoRoot, 'src/lib/assets/credits');

export const creditAssetContract = Object.freeze([
  createSvgContract('credit-lemon-simple-mono.svg', 'credit-mark', null, 3, '#2f2418', 16),
  createSvgContract('credit-lemon-simple-inverse.svg', 'credit-mark', null, 3, '#fff8ea', 16),
  createSvgContract('credit-lemon-simple-current-color.svg', 'credit-mark', null, 3, 'currentColor', 16),
  createSvgContract('credit-lemon-simple-color.svg', 'credit-mark', null, 3, 'multi', 24),
  ...([
    ['dinghy', 2],
    ['skiff', 3],
    ['sloop', 4],
    ['brig', 5],
    ['frigate', 4],
    ['galleon', 5],
    ['flagship', 6]
  ] as const satisfies readonly (readonly [ZdpCreditPackId, number])[]).map(([packId, pathCount]) => Object.freeze({
    fileName: `credit-pack-${packId}.svg`,
    format: 'svg' as const,
    kind: 'credit-pack-glyph' as const,
    packId,
    pathCount,
    fill: 'currentColor' as const,
    minimumCssPixels: 24,
    width: 48,
    height: 48,
    aspectRatio: '1:1' as const,
    viewBox: '0 0 48 48' as const,
    allowStroke: false,
    maxBytes: 1_000
  })),
  ...(['dinghy', 'skiff', 'sloop', 'brig', 'frigate', 'galleon', 'flagship'] as const satisfies readonly ZdpCreditPackId[]).map((packId) => Object.freeze({
    fileName: `credit-pack-keyart-${packId}.webp`,
    format: 'webp' as const,
    kind: 'credit-pack-keyart' as const,
    packId,
    minimumCssPixels: 160,
    width: 1600,
    height: 900,
    aspectRatio: '16:9' as const,
    maxBytes: 250_000
  }))
]);

function createSvgContract(
  fileName: string,
  kind: 'credit-mark',
  packId: null,
  pathCount: number,
  fill: string,
  minimumCssPixels: number
) {
  return Object.freeze({
    fileName,
    format: 'svg' as const,
    kind,
    packId,
    pathCount,
    fill,
    minimumCssPixels,
    width: 48,
    height: 48,
    aspectRatio: '1:1' as const,
    viewBox: '0 0 48 48' as const,
    allowStroke: false,
    maxBytes: 1_000
  });
}
