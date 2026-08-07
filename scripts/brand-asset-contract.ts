import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const brandOutputRoot = resolve(repoRoot, 'src/lib/assets/brand');

export const brandSourceContract = Object.freeze({
  og: Object.freeze({ fileName: 'og-background.png', width: 1731, height: 909, sha256: '8620f3c68d879d78e1e6905d2e6d9c7b4c4473bf0683bb62f9b062871ec45487' }),
  square: Object.freeze({ fileName: 'square-background.png', width: 1254, height: 1254, sha256: '4fb2c742f00eb53c00ce691f22f952d50a176b177666ac74630e897f48f3a309' }),
  editorial: Object.freeze({ fileName: 'editorial-background.png', width: 1448, height: 1086, sha256: '71a3dd0095ae1a2dfcac4b9cee3e1b14510fae5fcb047d214d80b12a8bedcdb4' }),
  landscape: Object.freeze({ fileName: 'landscape-background.png', width: 1672, height: 941, sha256: '5961de6a4693fb317cd18ea0104407f083ede84238ee105e981bfab5c4738204' })
});

export const forbiddenBrandAssetSha256 = '68240e0385d925423081a12ef09d956f48f53dd3ee49beca59288e68d1793a43';

export const brandOutputContract = Object.freeze([
  Object.freeze({ fileName: 'og-background-1200x630.jpg', width: 1200, height: 630, format: 'jpeg', maxBytes: 320_000 }),
  Object.freeze({ fileName: 'brand-square-1024.webp', width: 1024, height: 1024, format: 'webp', maxBytes: 500_000 }),
  Object.freeze({ fileName: 'brand-square-512.webp', width: 512, height: 512, format: 'webp', maxBytes: 180_000 }),
  Object.freeze({ fileName: 'brand-square-256.webp', width: 256, height: 256, format: 'webp', maxBytes: 70_000 }),
  Object.freeze({ fileName: 'editorial-1440x1080.webp', width: 1440, height: 1080, format: 'webp', maxBytes: 650_000 }),
  Object.freeze({ fileName: 'editorial-720x540.webp', width: 720, height: 540, format: 'webp', maxBytes: 220_000 }),
  Object.freeze({ fileName: 'landscape-1600x900.webp', width: 1600, height: 900, format: 'webp', maxBytes: 600_000 }),
  Object.freeze({ fileName: 'landscape-960x540.webp', width: 960, height: 540, format: 'webp', maxBytes: 260_000 }),
  Object.freeze({ fileName: 'landscape-640x360.webp', width: 640, height: 360, format: 'webp', maxBytes: 150_000 }),
  Object.freeze({ fileName: 'ship-mark.svg', width: 48, height: 48, format: 'svg', maxBytes: 2_500 }),
  Object.freeze({ fileName: 'ship-mark-simple-mono.svg', width: 48, height: 48, format: 'svg', maxBytes: 1_000 }),
  Object.freeze({ fileName: 'ship-mark-simple-inverse.svg', width: 48, height: 48, format: 'svg', maxBytes: 1_000 }),
  Object.freeze({ fileName: 'ship-mark-simple-current-color.svg', width: 48, height: 48, format: 'svg', maxBytes: 1_000 }),
  Object.freeze({ fileName: 'ship-mark-simple-tricolor.svg', width: 48, height: 48, format: 'svg', maxBytes: 1_000 })
]);
