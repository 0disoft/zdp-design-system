import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface PackageJson {
  readonly version?: string;
  readonly files?: readonly string[];
  readonly scripts?: Record<string, string>;
}

const root = process.cwd();
const failures: string[] = [];

const [
  packageJson,
  readme,
  contributing,
  serviceYaml,
  consumerContract,
  tokenDocument,
  publicEntry
] = await Promise.all([
  readPackageJson(join(root, 'package.json')),
  readFile(join(root, 'README.md'), 'utf8'),
  readFile(join(root, 'CONTRIBUTING.md'), 'utf8'),
  readFile(join(root, 'service.yaml'), 'utf8'),
  readFile(join(root, 'docs', 'CONSUMER_CONTRACT.md'), 'utf8'),
  readFile(join(root, 'tokens', 'zdp.tokens.json'), 'utf8'),
  readFile(join(root, 'src', 'lib', 'index.ts'), 'utf8')
]);

checkPackageSurface(packageJson);
checkConsumerContractDocument(consumerContract);
checkSynchronizedDocs(readme, contributing, serviceYaml);
checkTokenAndComponentSurface(tokenDocument, publicEntry);

if (failures.length > 0) {
  throw new Error(`Consumer contract check failed:\n- ${failures.join('\n- ')}`);
}

function checkPackageSurface(packageJson: PackageJson): void {
  if (packageJson.version !== '0.14.0') {
    failures.push('package.json version must be 0.14.0 for the dialog component package surface.');
  }

  if (!packageJson.files?.includes('docs/')) {
    failures.push('package.json files must include docs/ so the consumer contract ships with the package.');
  }

  if (packageJson.scripts?.['consumer:check'] !== 'bun scripts/check-consumer-contract.ts') {
    failures.push('package.json scripts.consumer:check must run the consumer contract checker.');
  }

  if (!packageJson.scripts?.check?.includes('bun scripts/check-consumer-contract.ts')) {
    failures.push('package.json check script must include the consumer contract checker.');
  }
}

function checkConsumerContractDocument(documentText: string): void {
  for (const requiredText of [
    '# Consumer Contract',
    "import 'zdp-design-system/styles.css';",
    "import 'zdp-design-system/locale-fonts.css';",
    "from 'zdp-design-system'",
    'Dialog',
    'tokens/zdp.tokens.json',
    '.zdp-surface-reset',
    'Astro',
    'Svelte',
    'Tauri',
    'Flutter',
    'hex',
    'oklch',
    'focus.surface',
    'control.heightMd',
    'focus trap',
    'keyboard focus',
    'public export',
    'opt-in',
    'zdp-design-system/src/...'
  ]) {
    if (!documentText.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing ${requiredText}.`);
    }
  }
}

function checkSynchronizedDocs(readme: string, contributing: string, serviceYaml: string): void {
  for (const requiredText of [
    'docs/CONSUMER_CONTRACT.md',
    "import 'zdp-design-system/styles.css';",
    "import 'zdp-design-system/locale-fonts.css';",
    'tokens/zdp.tokens.json',
    'Dialog는 모달 레이어',
    'Astro는 `styles.css`',
    'Flutter는 Svelte 컴포넌트를 직접 쓰지 않고'
  ]) {
    if (!readme.includes(requiredText)) {
      failures.push(`README.md is missing consumer contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'CONSUMER_CONTRACT.md',
    'public export',
    '내부 `src/` deep import',
    'Dialog는 `role="dialog"`',
    '대표 소비처'
  ]) {
    if (!contributing.includes(requiredText)) {
      failures.push(`CONTRIBUTING.md is missing consumer contract rule ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'consumer opt-in before broad adoption',
    'web, app, lab, and game surfaces can share token names without product-specific forks'
  ]) {
    if (!serviceYaml.includes(requiredText)) {
      failures.push(`service.yaml is missing consumer contract service text ${requiredText}.`);
    }
  }
}

function checkTokenAndComponentSurface(tokenDocument: string, publicEntry: string): void {
  for (const requiredText of [
    '"version": "0.5.0"',
    '"font"',
    '"breakpoint"',
    '"control"',
    '"i18n"',
    '"focus"',
    '"hex"',
    '"oklch"'
  ]) {
    if (!tokenDocument.includes(requiredText)) {
      failures.push(`tokens/zdp.tokens.json is missing consumer token surface ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export { default as Button }',
    'export { default as Dialog }',
    'export { default as Field }',
    'export { default as Input }',
    'export { default as Label }',
    'export { default as Surface }',
    'export { default as Tabs }',
    'export { zdpTokenNames }'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing consumer public entry ${requiredText}.`);
    }
  }
}

async function readPackageJson(path: string): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must be a JSON object.');
  }

  return {
    version: typeof parsed.version === 'string' ? parsed.version : undefined,
    files: isStringArray(parsed.files) ? parsed.files : undefined,
    scripts: isStringRecord(parsed.scripts) ? parsed.scripts : undefined
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}
