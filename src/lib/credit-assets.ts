export type ZdpCreditAssetTheme = 'light' | 'dark';
export type ZdpCreditAssetFormat = 'svg' | 'webp';
export type ZdpCreditAssetKind = 'credit-mark' | 'credit-pack-glyph' | 'credit-pack-keyart';
export type ZdpCreditPackId = 'dinghy' | 'skiff' | 'sloop' | 'brig' | 'frigate' | 'galleon' | 'flagship';

export interface ZdpCreditAsset {
  readonly id: string;
  readonly packagePath: string;
  readonly format: ZdpCreditAssetFormat;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: string;
  readonly kind: ZdpCreditAssetKind;
  readonly packId: ZdpCreditPackId | null;
  readonly themeSuitability: readonly ZdpCreditAssetTheme[];
  readonly intendedUse: readonly string[];
  readonly minimumCssPixels: number;
  readonly sha256: string;
}

export const zdpCreditAssets = Object.freeze({
  tangerine: Object.freeze([
    createCreditAsset('zdp-credit-tangerine-simple-mono', 'credit-tangerine-simple-mono.svg', 'credit-mark', null, ['light'], ['balance', 'credit-amount', 'monochrome'], 16, '6ca3af258f5e51ecd0c822d47d0128b1e8ae3ee8017df5332d01088572370c9f'),
    createCreditAsset('zdp-credit-tangerine-simple-inverse', 'credit-tangerine-simple-inverse.svg', 'credit-mark', null, ['dark'], ['balance', 'credit-amount', 'inverse'], 16, '994c7e95530580734dc7f5cd3143cd54b19c7b806430b5e35a1048e7949df707'),
    createCreditAsset('zdp-credit-tangerine-simple-current-color', 'credit-tangerine-simple-current-color.svg', 'credit-mark', null, ['light', 'dark'], ['balance', 'credit-amount', 'inline-current-color'], 16, '5e01ef81d542f9600a15b52b10726a6e9b60fa7bb79a4cf9819f4afa1ec56728'),
    createCreditAsset('zdp-credit-tangerine-simple-color', 'credit-tangerine-simple-color.svg', 'credit-mark', null, ['light'], ['wallet', 'credit-policy', 'display-color'], 24, 'e84ed5363efe5f39e3184d76df4132967e3a4e2feecd828c5cb40caa838e7ad4')
  ]),
  packs: Object.freeze([
    createCreditAsset('zdp-credit-pack-dinghy', 'credit-pack-dinghy.svg', 'credit-pack-glyph', 'dinghy', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color'], 24, '271626fc5d89155de9f10015d7eb595d5657fa44963698a532a63b1363cf4796'),
    createCreditAsset('zdp-credit-pack-skiff', 'credit-pack-skiff.svg', 'credit-pack-glyph', 'skiff', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color'], 24, '003dbe8c0779b693b57087ce240f9851a144a631ab58c9d964372f321a318180'),
    createCreditAsset('zdp-credit-pack-sloop', 'credit-pack-sloop.svg', 'credit-pack-glyph', 'sloop', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color'], 24, '535c63ece83ea756f6ddfe432886c52745c014bdf19df42981b3c6f35969b864'),
    createCreditAsset('zdp-credit-pack-brig', 'credit-pack-brig.svg', 'credit-pack-glyph', 'brig', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color'], 24, '069731a94dd19d74a9f711030cd07e6e0316b7f0ed8fd3ffec45d58e5cee271a'),
    createCreditAsset('zdp-credit-pack-frigate', 'credit-pack-frigate.svg', 'credit-pack-glyph', 'frigate', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color'], 24, 'f5c28ad24af69a6073ce46a613ef3429595da5a87b42de88f0663ba2589ecb43'),
    createCreditAsset('zdp-credit-pack-galleon', 'credit-pack-galleon.svg', 'credit-pack-glyph', 'galleon', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color'], 24, '4061ebfb4115406d269408669d2ac12b0e8383ad24f449879b2f5bb9a029cc46'),
    createCreditAsset('zdp-credit-pack-flagship', 'credit-pack-flagship.svg', 'credit-pack-glyph', 'flagship', ['light', 'dark'], ['credit-pack', 'compact-glyph', 'inline-current-color', 'command-pennant'], 24, '37ffa5daa4eb00c0b66bc9ca09382483112455945a987bdc3ca28390b9a1f39f')
  ]),
  keyart: Object.freeze([
    createCreditAsset('zdp-credit-pack-keyart-dinghy', 'credit-pack-keyart-dinghy.webp', 'credit-pack-keyart', 'dinghy', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart'], 160, '4baefcfea283c8778edd78ae08e4356d291e819b6982e8b0d8f62429806ef387', 1600, 900, '16:9'),
    createCreditAsset('zdp-credit-pack-keyart-skiff', 'credit-pack-keyart-skiff.webp', 'credit-pack-keyart', 'skiff', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart'], 160, 'd5556326a53bb52fb85cad09de6fde41f118ddb139c9f5e7e1ba0dd0f49bc9fe', 1600, 900, '16:9'),
    createCreditAsset('zdp-credit-pack-keyart-sloop', 'credit-pack-keyart-sloop.webp', 'credit-pack-keyart', 'sloop', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart'], 160, '41bd29de046682a997b35ca7f68d69af5015bc8af04d1b24e62acb62b7e003ed', 1600, 900, '16:9'),
    createCreditAsset('zdp-credit-pack-keyart-brig', 'credit-pack-keyart-brig.webp', 'credit-pack-keyart', 'brig', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart'], 160, '6a14c6b3ac7a00f32f65737a5e0144a6f3a1b2cc7ba87893a21cbeae44a56696', 1600, 900, '16:9'),
    createCreditAsset('zdp-credit-pack-keyart-frigate', 'credit-pack-keyart-frigate.webp', 'credit-pack-keyart', 'frigate', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart'], 160, 'a76edf6ed1268986d8c3f6c10edf710b46df46ba347d558a8da40c7c157a9538', 1600, 900, '16:9'),
    createCreditAsset('zdp-credit-pack-keyart-galleon', 'credit-pack-keyart-galleon.webp', 'credit-pack-keyart', 'galleon', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart'], 160, '16a51664f2a291cbb1807134c05faaff6ab39c1829d89d04d746a238345c3c97', 1600, 900, '16:9'),
    createCreditAsset('zdp-credit-pack-keyart-flagship', 'credit-pack-keyart-flagship.webp', 'credit-pack-keyart', 'flagship', ['light', 'dark'], ['credit-pack', 'pricing-card', 'selected-plan-detail', 'generated-keyart', 'command-pennant'], 160, '96aa5ea403e74105158a36fed69de354bb2d3f4b7b7d8102585aa162904e2bd6', 1600, 900, '16:9')
  ])
} as const);

function createCreditAsset(
  id: string,
  fileName: string,
  kind: ZdpCreditAssetKind,
  packId: ZdpCreditPackId | null,
  themeSuitability: readonly ZdpCreditAssetTheme[],
  intendedUse: readonly string[],
  minimumCssPixels: number,
  sha256: string,
  width = 48,
  height = 48,
  aspectRatio = '1:1'
): ZdpCreditAsset {
  const format: ZdpCreditAssetFormat = fileName.endsWith('.webp') ? 'webp' : 'svg';

  return Object.freeze({
    id,
    packagePath: `zdp-design-system/assets/credits/${fileName}`,
    format,
    width,
    height,
    aspectRatio,
    kind,
    packId,
    themeSuitability,
    intendedUse,
    minimumCssPixels,
    sha256
  });
}
