# Credit asset contract

`zdp-design-system` 0.51.0부터 ZDP 공용 크레딧인 귤과 크레딧 팩 함선의 시각 자산을 제공한다. 이 계약은 아이콘의 형태와 사용 규칙만 소유한다. 가격, 지급량, 보너스, 유효기간, 소진 순서, 환불, pack availability는 Money와 Architecture 계약이 소유한다.

## Public surface

메타데이터는 framework-neutral subpath에서 읽는다.

```ts
import { zdpCreditAssets } from 'zdp-design-system/credit-assets';
```

실제 파일은 `zdp-design-system/assets/credits/*` package subpath로 import한다.

```ts
import tangerine from 'zdp-design-system/assets/credits/credit-tangerine-simple-mono.svg';
import sloop from 'zdp-design-system/assets/credits/credit-pack-sloop.svg';
```

`packagePath`는 공개 package specifier다. 소비처는 내부 `src/` 경로를 import하지 않는다.

## Tangerine marks

| Variant | File | Minimum | Use |
| --- | --- | ---: | --- |
| Default mono | `credit-tangerine-simple-mono.svg` | 16 CSS px | balance, compact amount, light surface |
| Inverse | `credit-tangerine-simple-inverse.svg` | 16 CSS px | fixed dark surface |
| Current color | `credit-tangerine-simple-current-color.svg` | 16 CSS px | inline SVG inheriting consumer color |
| Display color | `credit-tangerine-simple-color.svg` | 24 CSS px | wallet and credit-policy display |

모든 귤은 원형 과실, 잎, 꼭지의 정확히 세 path로 구성한다. `currentColor` 파일은 inline SVG용이다. 외부 `<img>`는 소비처 CSS의 `color`를 상속하지 않는다.

구매 귤, 보너스 귤, 무료 귤, 보상 귤의 회계 속성을 귤 색깔만으로 표현하지 않는다. 동일한 귤 심볼 옆에 localized text 또는 Badge로 종류를 명시한다. 색은 보조 단서일 뿐 정책 식별자가 아니다.

## Credit pack ships

두 시각 계열은 서로 대체 관계가 아니다.

- `credit-pack-*.svg`: 표, 영수증, 지갑 목록의 24px 이상 compact glyph
- `credit-pack-keyart-*.webp`: 선택 카드와 큰 요금제 상세 패널의 160px 이상 cinematic key art

| Pack ID | Compact glyph | Pricing key art | Visual distinction |
| --- | --- | --- | --- |
| `dinghy` | `credit-pack-dinghy.svg` | `credit-pack-keyart-dinghy.webp` | small polished boat, oar, first cargo crate |
| `skiff` | `credit-pack-skiff.svg` | `credit-pack-keyart-skiff.webp` | longer open hull and lateen sail |
| `sloop` | `credit-pack-sloop.svg` | `credit-pack-keyart-sloop.webp` | one mast and two large sails |
| `brig` | `credit-pack-brig.svg` | `credit-pack-keyart-brig.webp` | exact two-mast merchant brig |
| `frigate` | `credit-pack-frigate.svg` | `credit-pack-keyart-frigate.webp` | long three-mast merchant vessel |
| `galleon` | `credit-pack-galleon.svg` | `credit-pack-keyart-galleon.webp` | tall ornate stern and layered sails |
| `flagship` | `credit-pack-flagship.svg` | `credit-pack-keyart-flagship.webp` | largest command ship, pennant and brass crest |

Compact glyph는 모두 `currentColor`, `48×48` viewBox, fill-only path로 제공하며 최소 24 CSS px에서 사용한다. Pricing key art는 `1600×900` WebP이며 선택 카드에서는 thumbnail crop으로, 선택된 요금제에서는 큰 16:9 이미지로 사용한다. 각 이미지의 오른쪽 약 30%는 HTML 상세 정보가 올라갈 수 있도록 비교적 어둡고 조용하게 구성했다. 이미지 안에 가격이나 UI 문구를 합성하지 않는다. 생성·파생·해시 근거는 [`CREDIT_KEYART_PROVENANCE.md`](CREDIT_KEYART_PROVENANCE.md)에 기록한다.

함선만 보고 요금제나 가격을 추측하게 만들지 않는다. 가격표와 구매 화면에는 localized pack name, 가격, 지급 귤, 보너스, 세금 정보를 텍스트로 함께 표시한다. `packId`와 가격·지급량 연결은 소비처의 검토된 Money 계약에서 가져온다.

## Accessibility and rendering

- 주변 텍스트가 동일한 의미를 이미 제공하면 SVG는 `alt=""` 또는 `aria-hidden="true"`로 장식 처리한다.
- 심볼이 유일한 의미 전달 수단이면 소비처가 현재 locale과 문맥에 맞는 accessible name을 제공한다.
- 색상만으로 귤 종류, 선택 상태, 가격 우위, 추천 여부를 전달하지 않는다.
- Compact glyph의 SVG 비율을 바꾸거나 path를 분리해서 재색칠하지 않는다. Key art는 16:9 비율을 유지하고 선택 카드 crop에서도 함선 전체 식별이 남게 한다.
- 소비처는 디자인 시스템 asset ID나 pack ID를 결제 권한, 가격, 지급량의 정본으로 쓰지 않는다.

## Ownership boundary

디자인 시스템은 SVG, stable asset ID, package path, 최소 크기, theme suitability와 intended use를 소유한다. Money와 Architecture는 pack ID의 존재와 상태, 가격, 지급량, 보너스, 세금, 회계 원장 및 소비 순서를 소유한다. 제품은 locale 문구, 배치, accessible name과 현재 판매 가능 상태를 소유한다.
