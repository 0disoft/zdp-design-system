import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { checkDependencyPolicies } from './dependency-policy';

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

const dependencies = [['@storybook/addon-a11y', '^10.6.0'], ['axe-core', '^4.13.0']] as const;
const policies = await Promise.all(dependencies.map(async ([name, supported]) => ({
  range: packageJson.devDependencies?.[name] ?? '',
  installed: JSON.parse(await readFile(join(root, 'node_modules', name, 'package.json'), 'utf8')).version as string,
  supported
})));
for (const [index, valid] of checkDependencyPolicies(policies).entries()) {
  if (!valid) failures.push(`${dependencies[index]?.[0]} must install a supported stable version and allow same-major stable updates, excluding the next major.`);
}

assert.deepEqual(checkDependencyPolicies([
  { range: '^10.6.1', installed: '10.6.2', supported: '^10.6.0' },
  { range: '>=10.6.1 <11', installed: '10.6.2', supported: '^10.6.0' },
  { range: '10.6.2', installed: '10.6.2', supported: '^10.6.0' },
  { range: '~10.6.2', installed: '10.6.2', supported: '^10.6.0' },
  { range: '*', installed: '10.6.2', supported: '^10.6.0' },
  { range: '^11', installed: '11.0.0', supported: '^10.6.0' },
  { range: '^10.6.0', installed: '10.6.1-beta.1', supported: '^10.6.0' }
]), [true, true, false, false, false, false, false], 'Dependency compatibility policy regression.');

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
