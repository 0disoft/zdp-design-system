import { posix } from 'node:path';

type PackageExportNode = string | PackageExportMap;

interface PackageExportMap {
  readonly [key: string]: PackageExportNode;
}

export const expectedPackageExports = {
  '.': {
    svelte: './dist/index.js',
    types: './dist/index.d.ts',
    import: './dist/index.js',
    default: './dist/index.js'
  },
  './styles.css': './dist/styles/index.css',
  './tokens.css': './dist/styles/tokens.css',
  './brand-fonts.css': './dist/styles/brand-fonts.css',
  './expressive-fonts.css': './dist/styles/expressive-fonts.css',
  './locale-fonts.css': './dist/styles/locale-fonts.css',
  './components/*': {
    svelte: './dist/components/*.svelte',
    default: './dist/components/*.svelte'
  },
  './share': {
    types: './dist/share.d.ts',
    import: './dist/share.js',
    default: './dist/share.js'
  },
  './brand-assets': {
    types: './dist/brand-assets.ts',
    import: './dist/brand-assets.js',
    default: './dist/brand-assets.js'
  },
  './credit-assets': {
    types: './dist/credit-assets.ts',
    import: './dist/credit-assets.js',
    default: './dist/credit-assets.js'
  },
  './assets/brand/og-background-1200x630.jpg': './dist/assets/brand/og-background-1200x630.jpg',
  './assets/brand/brand-square-1024.webp': './dist/assets/brand/brand-square-1024.webp',
  './assets/brand/brand-square-512.webp': './dist/assets/brand/brand-square-512.webp',
  './assets/brand/brand-square-256.webp': './dist/assets/brand/brand-square-256.webp',
  './assets/brand/editorial-1440x1080.webp': './dist/assets/brand/editorial-1440x1080.webp',
  './assets/brand/editorial-720x540.webp': './dist/assets/brand/editorial-720x540.webp',
  './assets/brand/landscape-1600x900.webp': './dist/assets/brand/landscape-1600x900.webp',
  './assets/brand/landscape-960x540.webp': './dist/assets/brand/landscape-960x540.webp',
  './assets/brand/landscape-640x360.webp': './dist/assets/brand/landscape-640x360.webp',
  './assets/brand/ship-mark.svg': './dist/assets/brand/ship-mark.svg',
  './assets/brand/ship-mark-simple-mono.svg': './dist/assets/brand/ship-mark-simple-mono.svg',
  './assets/brand/ship-mark-simple-inverse.svg': './dist/assets/brand/ship-mark-simple-inverse.svg',
  './assets/brand/ship-mark-simple-current-color.svg': './dist/assets/brand/ship-mark-simple-current-color.svg',
  './assets/brand/ship-mark-simple-tricolor.svg': './dist/assets/brand/ship-mark-simple-tricolor.svg',
  './assets/brand/rodi-mark.svg': './dist/assets/brand/rodi-mark.svg',
  './assets/brand/rodi-mark-1254.png': './dist/assets/brand/rodi-mark-1254.png',
  './assets/credits/credit-lemon-simple-mono.svg': './dist/assets/credits/credit-lemon-simple-mono.svg',
  './assets/credits/credit-lemon-simple-inverse.svg': './dist/assets/credits/credit-lemon-simple-inverse.svg',
  './assets/credits/credit-lemon-simple-current-color.svg': './dist/assets/credits/credit-lemon-simple-current-color.svg',
  './assets/credits/credit-lemon-simple-color.svg': './dist/assets/credits/credit-lemon-simple-color.svg',
  './assets/credits/credit-pack-dinghy.svg': './dist/assets/credits/credit-pack-dinghy.svg',
  './assets/credits/credit-pack-skiff.svg': './dist/assets/credits/credit-pack-skiff.svg',
  './assets/credits/credit-pack-sloop.svg': './dist/assets/credits/credit-pack-sloop.svg',
  './assets/credits/credit-pack-brig.svg': './dist/assets/credits/credit-pack-brig.svg',
  './assets/credits/credit-pack-frigate.svg': './dist/assets/credits/credit-pack-frigate.svg',
  './assets/credits/credit-pack-galleon.svg': './dist/assets/credits/credit-pack-galleon.svg',
  './assets/credits/credit-pack-flagship.svg': './dist/assets/credits/credit-pack-flagship.svg',
  './assets/credits/credit-pack-keyart-dinghy.webp': './dist/assets/credits/credit-pack-keyart-dinghy.webp',
  './assets/credits/credit-pack-keyart-skiff.webp': './dist/assets/credits/credit-pack-keyart-skiff.webp',
  './assets/credits/credit-pack-keyart-sloop.webp': './dist/assets/credits/credit-pack-keyart-sloop.webp',
  './assets/credits/credit-pack-keyart-brig.webp': './dist/assets/credits/credit-pack-keyart-brig.webp',
  './assets/credits/credit-pack-keyart-frigate.webp': './dist/assets/credits/credit-pack-keyart-frigate.webp',
  './assets/credits/credit-pack-keyart-galleon.webp': './dist/assets/credits/credit-pack-keyart-galleon.webp',
  './assets/credits/credit-pack-keyart-flagship.webp': './dist/assets/credits/credit-pack-keyart-flagship.webp',
  './split-pane': {
    types: './dist/split-pane.ts',
    import: './dist/split-pane.js',
    default: './dist/split-pane.js'
  },
  './tokens': './dist/tokens/zdp.tokens.json'
} as const satisfies Readonly<Record<string, PackageExportNode>>;

export const expectedPackageExportTargets = Object.freeze(
  [...new Set(collectExportTargets(expectedPackageExports))].filter((target) => !target.includes('*'))
);

export function validatePackageExports(exportsValue: unknown): readonly string[] {
  const failures: string[] = [];

  validateExactExportNode(exportsValue, expectedPackageExports, 'package.json exports', failures);
  validateExportLeaves(exportsValue, 'package.json exports', failures);

  return failures;
}

function validateExactExportNode(
  actual: unknown,
  expected: PackageExportNode,
  location: string,
  failures: string[]
): void {
  if (typeof expected === 'string') {
    if (actual !== expected) {
      failures.push(`${location} must be ${expected}.`);
    }

    return;
  }

  if (!isRecord(actual)) {
    failures.push(`${location} must be an object.`);
    return;
  }

  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);

  for (const key of expectedKeys) {
    if (!Object.hasOwn(actual, key)) {
      failures.push(`${formatExportLocation(location, key)} is required.`);
      continue;
    }

    const expectedNode = expected[key];
    if (expectedNode === undefined) {
      failures.push(`${formatExportLocation(location, key)} has an invalid undefined expectation.`);
      continue;
    }

    validateExactExportNode(actual[key], expectedNode, formatExportLocation(location, key), failures);
  }

  for (const key of actualKeys.filter((key) => !Object.hasOwn(expected, key)).sort()) {
    failures.push(`${formatExportLocation(location, key)} is not an intended public export.`);
  }
}

function validateExportLeaves(value: unknown, location: string, failures: string[]): void {
  if (typeof value === 'string') {
    if (!isDistPackageTarget(value)) {
      failures.push(`${location} target ${value} must resolve under ./dist/**.`);
    }

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const key of Object.keys(value).sort()) {
    validateExportLeaves(value[key], formatExportLocation(location, key), failures);
  }
}

function collectExportTargets(node: PackageExportNode): string[] {
  if (typeof node === 'string') {
    return [node];
  }

  return Object.values(node).flatMap((child) => collectExportTargets(child));
}

function isDistPackageTarget(target: string): boolean {
  if (!target.startsWith('./dist/') || target.includes('\\')) {
    return false;
  }

  return posix.normalize(target.slice(2)).startsWith('dist/');
}

function formatExportLocation(parent: string, key: string): string {
  return `${parent}[${JSON.stringify(key)}]`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
