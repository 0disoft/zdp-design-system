# Brand asset contract

`zdp-design-system` 0.50.0부터 제품 데이터가 없거나 공유 미리보기를 만들 때 쓰는 ZDP 공용 fallback 이미지를 제공한다. 0.51.0부터 기존 상세형 ship mark를 보존하면서 세 도형으로 구성한 `ship-mark-simple-*` 제품군을 추가로 제공한다. 이 표면은 제품명, 설명, CTA, locale 문구를 포함하지 않는다.

## Public surface

메타데이터는 framework-neutral subpath에서 읽는다.

```ts
import { zdpBrandAssets } from 'zdp-design-system/brand-assets';
```

실제 파일은 `zdp-design-system/assets/brand/*` package subpath로 import한다. Vite에서는 다음 import가 정적 asset URL 문자열을 만든다.

```ts
import ogBackground from 'zdp-design-system/assets/brand/og-background-1200x630.jpg';
import squareFallback from 'zdp-design-system/assets/brand/brand-square-512.webp';
```

Astro에서는 같은 import가 `ImageMetadata`를 만든다. Astro의 `<Image>`에 그대로 전달하거나 native `<img>`를 쓸 때 `.src`, `.width`, `.height`를 명시한다.

```astro
---
import { Image } from 'astro:assets';
import landscapeFallback from 'zdp-design-system/assets/brand/landscape-640x360.webp';
---

<Image src={landscapeFallback} alt="" />
```

`packagePath`는 소비처가 선택할 파일을 찾기 위한 안정된 package specifier다. 디자인 시스템 runtime이 CDN origin이나 제품 public path를 추측하지 않는다.

## Asset matrix

| Role | Files | Ratio | Crop | Surface |
| --- | --- | --- | --- | --- |
| Open Graph background | `og-background-1200x630.jpg` | 40:21 | right safe area preserved | dark |
| Square brand fallback | `brand-square-{1024,512,256}.webp` | 1:1 | none | dark |
| Editorial fallback | `editorial-{1440x1080,720x540}.webp` | 4:3 | none; frame must remain visible | light |
| Landscape fallback | `landscape-{1600x900,960x540,640x360}.webp` | 16:9 | none | dark |
| Detailed ship mark (compatibility) | `ship-mark.svg` | 1:1 | none | light |
| Simple ship mark, default mono | `ship-mark-simple-mono.svg` | 1:1 | none | light |
| Simple ship mark, inverse | `ship-mark-simple-inverse.svg` | 1:1 | none | dark |
| Simple ship mark, inheritable | `ship-mark-simple-current-color.svg` | 1:1 | none | inline SVG; light or dark |
| Simple ship mark, display tricolor | `ship-mark-simple-tricolor.svg` | 1:1 | none | light; 32 CSS px or larger |

Raster derivatives are encoded without retained source metadata. WebP and JPEG files use the browser-standard untagged sRGB interpretation; the maintainer generator passes explicit sRGB output intent and does not preserve an input profile. AVIF is intentionally absent until a measured consumer need justifies another format.

## Rendering rules

- Use the declared `aspectRatio` before the image loads so failure and slow-network states do not collapse layout.
- Default to `object-fit: contain`. Do not use `cover` for the editorial frame, landscape sailboat, square mark, or OG safe-area composition.
- Select a width close to the rendered CSS width. Do not ship the 1600 or 1440 source to a 320 CSS px card.
- The OG background contains no text. The consumer owns title, logo lockup, locale, and social metadata composition inside the right safe area.
- The square raster already contains the official ship mark. Do not overlay another mark.
- 새 배치에서는 `ship-mark-simple-mono.svg`를 기본 심볼로 쓴다. 기존 `ship-mark.svg`는 이미 배포된 상세형 표면과 호환할 때만 유지한다.
- 어두운 고정 배경에는 `ship-mark-simple-inverse.svg`를 쓴다. 단색을 임의 필터나 opacity로 뒤집지 않는다.
- 소비처 색을 따라야 할 때는 `ship-mark-simple-current-color.svg`를 inline SVG로 삽입한다. 외부 `<img>`는 소비처 CSS의 `color`를 상속하지 않으므로 이 파일을 `<img>` 색상 변경 수단으로 쓰지 않는다.
- `ship-mark-simple-tricolor.svg`는 넓은 브랜드 소개·캠페인 표면에서만 32 CSS px 이상으로 쓴다. 작은 아이콘, 상태 표시, 본문 장식에는 단색을 쓴다.
- simple 제품군은 왼쪽 작은 직각삼각형, 오른쪽 큰 직각삼각형, 아래 사다리꼴의 정확히 세 path와 그 사이 여백으로 구성한다. path 비율, 순서, 간격, 지정 색을 소비처에서 따로 바꾸지 않는다.

Decorative backgrounds use `alt=""`. When an image itself conveys content, the consumer owns a context-specific localized `alt`; the design system does not invent product copy. A ship mark inside an already named brand link is decorative and also uses `alt=""`.

## Source and generation boundary

Large source PNGs are deliberately not stored in this repository or included in the npm package. Keep them in the maintainer-owned brand/media asset store. `src/lib/assets/brand/` contains only the allowlisted publishable derivatives, the detailed ship SVG, and the exact simple ship SVG variants.

When intentionally rebuilding derivatives, materialize the four files below in one external directory and run `bun run brand-assets:generate -- --source-dir <directory>`. Then visually review Storybook before accepting changed output hashes. The generator rejects any source whose SHA-256 differs, uses Lanczos resizing, renders the exact SVG with the repository's existing Chromium runtime, strips source metadata, and writes only the declared derivatives. `bun run brand-assets:check` validates output hashes, dimensions, formats, byte budgets, allowlists, SVG paths, repository/package source exclusion, and the forbidden distorted-logo hash.

| Source file | Dimensions | SHA-256 |
| --- | ---: | --- |
| `og-background.png` | 1731 × 909 | `8620f3c68d879d78e1e6905d2e6d9c7b4c4473bf0683bb62f9b062871ec45487` |
| `square-background.png` | 1254 × 1254 | `4fb2c742f00eb53c00ce691f22f952d50a176b177666ac74630e897f48f3a309` |
| `editorial-background.png` | 1448 × 1086 | `71a3dd0095ae1a2dfcac4b9cee3e1b14510fae5fcb047d214d80b12a8bedcdb4` |
| `landscape-background.png` | 1672 × 941 | `5961de6a4693fb317cd18ea0104407f083ede84238ee105e981bfab5c4738204` |

The four raster source images were generated with OpenAI image generation at the repository maintainer's direction, selected by the maintainer, and supplied for this package. The maintainer authorizes the checked derivatives to be redistributed as part of `zdp-design-system` under this package's MIT license. The detailed and simple ship SVGs are ZDP brand marks maintained in this repository; they are distributed under the same package license. No stock-image or third-party asset source is asserted for this asset set.
