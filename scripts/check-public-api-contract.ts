import {
  comparePublicApiContracts,
  createGitRefReader,
  createPublicApiContract,
  createWorkingTreeReader,
  formatPublicApiComparison,
  readChangedReleaseIntent,
  validateVersionForApiChange,
  type ComponentContract,
  type PublicApiContract
} from './public-api-contract';

interface CliOptions {
  readonly baseRef?: string;
  readonly print: boolean;
}

const options = parseCliOptions(process.argv.slice(2));
runComparatorSelfTest();

const current = await createPublicApiContract(createWorkingTreeReader());

if (options.print) {
  process.stdout.write(`${JSON.stringify(current, null, 2)}\n`);
}

if (options.baseRef) {
  const base = await createPublicApiContract(createGitRefReader(options.baseRef));
  const comparison = comparePublicApiContracts(base, current);
  const releaseIntent = await readChangedReleaseIntent(options.baseRef);
  const versionFailures = validateVersionForApiChange(
    base.packageVersion,
    current.packageVersion,
    comparison.level,
    releaseIntent?.bump ?? null
  );

  console.log(formatPublicApiComparison(base, current, comparison));
  console.log(
    releaseIntent
      ? `Release intent: ${releaseIntent.bump} from ${releaseIntent.files.join(', ')}.`
      : 'Release intent: no new or updated release fragment.'
  );

  if (versionFailures.length > 0) {
    throw new Error(`Public API version policy failed:\n- ${versionFailures.join('\n- ')}`);
  }
} else if (!options.print) {
  console.log(
    `Public API contract is readable: ${current.rootExports.length} root exports, ` +
    `${current.components.length} components, ${current.tokens.length} tokens.`
  );
}

function parseCliOptions(args: readonly string[]): CliOptions {
  let baseRef: string | undefined;
  let print = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--print') {
      print = true;
      continue;
    }

    if (argument === '--base-ref') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--base-ref requires a git ref or commit SHA.');
      }
      baseRef = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument ?? '<missing>'}.`);
  }

  return { ...(baseRef ? { baseRef } : {}), print };
}

function runComparatorSelfTest(): void {
  const base = createFixtureContract('0.61.0', [
    createFixtureComponent('Button', [
      { name: 'disabled', type: 'boolean', required: false, bindable: false, defaultValue: 'false' }
    ])
  ]);
  const additive = createFixtureContract('0.62.0', [
    createFixtureComponent('Button', [
      { name: 'disabled', type: 'boolean', required: false, bindable: false, defaultValue: 'false' },
      { name: 'loading', type: 'boolean', required: false, bindable: false, defaultValue: 'false' }
    ])
  ]);
  const breaking = createFixtureContract('0.62.0', [
    createFixtureComponent('Button', [
      { name: 'disabled', type: 'boolean', required: true, bindable: false }
    ])
  ]);

  assertEqual(comparePublicApiContracts(base, additive).level, 'additive', 'optional prop addition');
  assertEqual(comparePublicApiContracts(base, breaking).level, 'breaking', 'requiredness change');
  assertEqual(validateVersionForApiChange('0.61.0', '0.61.1', 'additive').length, 1, '0.x patch rejection');
  assertEqual(validateVersionForApiChange('0.61.0', '0.61.0', 'additive', 'minor').length, 0, '0.x minor fragment acceptance');
  assertEqual(validateVersionForApiChange('0.61.0', '0.61.0', 'breaking', 'patch').length, 1, '0.x patch fragment rejection');
  assertEqual(validateVersionForApiChange('0.61.0', '0.62.0', 'breaking').length, 0, '0.x minor acceptance');
  assertEqual(validateVersionForApiChange('1.4.0', '1.4.0', 'breaking', 'minor').length, 1, 'stable minor fragment rejection');
  assertEqual(validateVersionForApiChange('1.4.0', '1.4.0', 'breaking', 'major').length, 0, 'stable major fragment acceptance');
  assertEqual(validateVersionForApiChange('1.4.0', '1.5.0', 'breaking').length, 1, 'stable major rejection');
  assertEqual(validateVersionForApiChange('1.4.0', '2.0.0', 'breaking').length, 0, 'stable major acceptance');
}

function createFixtureContract(
  packageVersion: string,
  components: readonly ComponentContract[]
): PublicApiContract {
  return {
    schemaVersion: 'zdp.public-api/v1',
    packageName: 'zdp-design-system',
    packageVersion,
    packageExports: [],
    rootExports: [],
    components,
    tokens: []
  };
}

function createFixtureComponent(
  name: string,
  props: ComponentContract['props']
): ComponentContract {
  return {
    name,
    source: `./components/${name}.svelte`,
    props,
    slots: ['default'],
    typeDeclarations: []
  };
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `Public API comparator self-test failed for ${label}: ` +
      `expected ${String(expected)}, received ${String(actual)}.`
    );
  }
}
