import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const previewPath = join(root, '.storybook', 'preview.ts');
const packagePath = join(root, 'package.json');
const preview = await readFile(previewPath, 'utf8');
const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
  readonly scripts?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
};

const failures: string[] = [];

if (!preview.includes("a11y: {\n      test: 'error'\n    }")) {
  failures.push('.storybook/preview.ts must keep addon-a11y test mode set to error.');
}

if (packageJson.devDependencies?.['@storybook/addon-a11y'] !== '10.4.2') {
  failures.push('package.json must keep @storybook/addon-a11y pinned for the a11y gate contract.');
}

if (packageJson.devDependencies?.['axe-core'] !== '4.12.0') {
  failures.push('package.json must keep axe-core pinned for reproducible runtime story audits.');
}

if (packageJson.scripts?.['a11y:check'] !== 'bun scripts/check-storybook-a11y.ts') {
  failures.push('package.json scripts.a11y:check must run the Storybook a11y gate checker.');
}

if (packageJson.scripts?.['a11y:runtime:check'] !== 'node scripts/check-storybook-runtime-a11y.mjs') {
  failures.push('package.json scripts.a11y:runtime:check must run rendered Storybook axe audits.');
}

if (!packageJson.scripts?.check?.includes('bun run a11y:check')) {
  failures.push('package.json check script must include the Storybook a11y gate checker.');
}

if (!packageJson.scripts?.check?.includes('bun run a11y:runtime:check')) {
  failures.push('package.json check script must include rendered Storybook axe audits.');
}

if (failures.length > 0) {
  throw new Error(`Storybook a11y gate check failed:\n- ${failures.join('\n- ')}`);
}

console.log('Storybook a11y gate check passed.');
