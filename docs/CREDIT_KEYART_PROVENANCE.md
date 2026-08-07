# Credit pack key-art provenance

The seven pricing key-art images were generated on 2026-07-31 with the built-in OpenAI GPT image generation tool at the repository maintainer's direction. A user-supplied dark fantasy selection-screen screenshot was used only as a mood and composition reference. No character, text, UI frame, icon, logo, or exact scene from the reference is included in the outputs.

## Shared generation brief

- 16:9 cinematic website pricing key art, one vessel per image.
- Realistic painterly premium game presentation with historically plausible materials and restrained fantasy polish.
- Three-quarter view, full vessel inside safe margins, vessel weighted left with the rightmost 30% kept darker and quieter for HTML plan details.
- Dark navy sea and sky, burnt-umber wood, ivory sails, tangerine-orange cargo or lantern accents, antique brass, muted sage, atmospheric mist, restrained warm rim light.
- No text, letters, numbers, logo, watermark, UI frame, border, people, pirates, skulls, combat, cannon fire, explosions, neon, cartoon styling, or embedded pricing information.

Tier deltas were limited to vessel structure and presentation: Dinghy has one oar and one cargo crate; Skiff adds a lateen sail and second crate; Sloop uses one mast and two large sails; Brig is an exact two-mast merchant brig; Frigate is a long three-mast merchant vessel; Galleon adds a high ornate stern; Flagship adds the largest command vessel, long pennant, and brass crest. The first Brig output was rejected because it implied a third mast and military detailing; the recorded derivative uses the second generation.

## Derivative process

Built-in outputs were 1672×941 RGB PNG files. The publishable files were center-cropped by at most one vertical pixel to exact 16:9, resized to 1600×900 with Lanczos resampling, and encoded as WebP at quality 88 and method 6. Source PNGs are not included in the npm package. The repository ships only reviewed WebP derivatives.

| Pack | Source PNG SHA-256 | Publishable WebP SHA-256 |
| --- | --- | --- |
| Dinghy | `8ff8392d9dc41938d50ea7268c997849ddbc6cd5a632ea534849ee4b3f3fb183` | `4baefcfea283c8778edd78ae08e4356d291e819b6982e8b0d8f62429806ef387` |
| Skiff | `c52cdaa4675124b15eb801be677b08d2a27195e43b0b1e8d2f261cdad1e1dcc9` | `d5556326a53bb52fb85cad09de6fde41f118ddb139c9f5e7e1ba0dd0f49bc9fe` |
| Sloop | `41cf24a6c8c9fc73895508f05b3e24ab39c6c7d819e2636d95497b9ac79edc8f` | `41bd29de046682a997b35ca7f68d69af5015bc8af04d1b24e62acb62b7e003ed` |
| Brig | `c468adb9904f1ce37e5f37450b807da9e05298cbd56d2982aa6ebf32f22b84fa` | `6a14c6b3ac7a00f32f65737a5e0144a6f3a1b2cc7ba87893a21cbeae44a56696` |
| Frigate | `975cd5f5add0f4a9ed6d0906f4a10d3a76c0d11f23dc822b118a3f7f44b94fa8` | `a76edf6ed1268986d8c3f6c10edf710b46df46ba347d558a8da40c7c157a9538` |
| Galleon | `4c205bde7d3cc52564a722a06be76e900ebc07a61495f70ce9ad3289bc4c946a` | `16a51664f2a291cbb1807134c05faaff6ab39c1829d89d04d746a238345c3c97` |
| Flagship | `c0ff77c817f96cac86bdc74a0a2bf00f23f33ffebab9574189bd04d683b6700d` | `96aa5ea403e74105158a36fed69de354bb2d3f4b7b7d8102585aa162904e2bd6` |

The maintainer authorizes the reviewed WebP derivatives to be redistributed as part of `zdp-design-system` under the package MIT license. No stock-image or third-party asset source is asserted for this set.
