export type ZdpBrandAssetFormat = 'jpeg' | 'webp' | 'svg';
export type ZdpBrandAssetTheme = 'light' | 'dark';
export type ZdpBrandAssetCropPolicy = 'none' | 'safe-area-preserved';

export interface ZdpBrandAsset {
  readonly id: string;
  readonly packagePath: string;
  readonly format: ZdpBrandAssetFormat;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: string;
  readonly themeSuitability: readonly ZdpBrandAssetTheme[];
  readonly intendedUse: readonly string[];
  readonly cropPolicy: ZdpBrandAssetCropPolicy;
  readonly decorative: boolean;
  readonly sha256: string;
}

export const zdpBrandAssets = Object.freeze({
  ogBackground: Object.freeze({
    id: 'zdp-brand-og-background',
    packagePath: 'zdp-design-system/assets/brand/og-background-1200x630.jpg',
    format: 'jpeg',
    width: 1200,
    height: 630,
    aspectRatio: '40:21',
    themeSuitability: ['dark'] as const,
    intendedUse: ['open-graph', 'social-preview'] as const,
    cropPolicy: 'safe-area-preserved',
    decorative: true,
    sha256: '665659774f4c3134c8644a5c17fdc671235c3fc5d2d969858798d575a0ed157c'
  }),
  square: Object.freeze([
    createAsset('zdp-brand-square-1024', 'brand-square-1024.webp', 'webp', 1024, 1024, '1:1', ['dark'], ['brand-fallback', 'avatar-fallback'], true, '2c74f5972510b86dfefb753ccac73a7915fe60a17ce7f7197df570fab13bcf0d'),
    createAsset('zdp-brand-square-512', 'brand-square-512.webp', 'webp', 512, 512, '1:1', ['dark'], ['brand-fallback', 'avatar-fallback'], true, '7915866cc9e9564a5c3899b27e139f7100de218dc16c888392b00e4cf24ea326'),
    createAsset('zdp-brand-square-256', 'brand-square-256.webp', 'webp', 256, 256, '1:1', ['dark'], ['brand-fallback', 'avatar-fallback'], true, 'f227a320be9e47f3d6964b7fcf3fc2fae13d5c8f59ff947de32076836c0177f4')
  ]),
  editorial: Object.freeze([
    createAsset('zdp-brand-editorial-1440', 'editorial-1440x1080.webp', 'webp', 1440, 1080, '4:3', ['light'], ['editorial-fallback'], true, '77def4e91776373c5eb7bf6b62c2b28a1a83ca82daa2b64e343b9fbefe14ce97'),
    createAsset('zdp-brand-editorial-720', 'editorial-720x540.webp', 'webp', 720, 540, '4:3', ['light'], ['editorial-fallback'], true, '12c3c92db9e325c7e8b4cb4781b67a0d9f0b812a3fa41ecad97219649ddf854b')
  ]),
  landscape: Object.freeze([
    createAsset('zdp-brand-landscape-1600', 'landscape-1600x900.webp', 'webp', 1600, 900, '16:9', ['dark'], ['landscape-fallback'], true, '14a8f9adee5be17da97d416f30dc00005f2c385ef472cc684e487f54db3425ce'),
    createAsset('zdp-brand-landscape-960', 'landscape-960x540.webp', 'webp', 960, 540, '16:9', ['dark'], ['landscape-fallback'], true, '00a6d41a8ba394c0e6dabf8418b63b33b271cf0c9caca6c7e766aa75ce7003cd'),
    createAsset('zdp-brand-landscape-640', 'landscape-640x360.webp', 'webp', 640, 360, '16:9', ['dark'], ['landscape-fallback'], true, 'a3efe784feacc0eb4ebf8269c7c272e40b98f9724aef6e29243312642e92c7e5')
  ]),
  shipMark: Object.freeze({
    id: 'zdp-brand-ship-mark',
    packagePath: 'zdp-design-system/assets/brand/ship-mark.svg',
    format: 'svg',
    width: 48,
    height: 48,
    aspectRatio: '1:1',
    themeSuitability: ['light'] as const,
    intendedUse: ['brand-mark'] as const,
    cropPolicy: 'none',
    decorative: false,
    sha256: '79bd535918a3b3b2d9ba2a404a2fee3a8e507902b4285d8bae526e212818e2ca'
  })
} as const satisfies Readonly<Record<string, ZdpBrandAsset | readonly ZdpBrandAsset[]>>);

function createAsset(
  id: string,
  fileName: string,
  format: ZdpBrandAssetFormat,
  width: number,
  height: number,
  aspectRatio: string,
  themeSuitability: readonly ZdpBrandAssetTheme[],
  intendedUse: readonly string[],
  decorative: boolean,
  sha256: string
): ZdpBrandAsset {
  return Object.freeze({
    id,
    packagePath: `zdp-design-system/assets/brand/${fileName}`,
    format,
    width,
    height,
    aspectRatio,
    themeSuitability,
    intendedUse,
    cropPolicy: 'none',
    decorative,
    sha256
  });
}
