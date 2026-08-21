import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  metricDefinitions,
  type BaselineResult,
  type MetricKey,
  type PackageMeasurement,
  type PackageSizeBudget
} from './package-size/model.ts';
import { measureTarball, packPackage } from './package-size/package-measure.ts';
import { evaluateMetrics, renderMarkdown } from './package-size/report.ts';

interface CliOptions {
  readonly budgetPath: string;
  readonly markdownPath: string | null;
  readonly jsonPath: string | null;
  readonly baseline: 'auto' | 'none' | string;
}

const root = fileURLToPath(new URL('..', import.meta.url));

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const budget = await readBudget(options.budgetPath);
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'zdp-package-size-'));

  try {
    const currentDirectory = join(temporaryRoot, 'current');
    await mkdir(currentDirectory);
    const currentTarball = await packPackage(root, currentDirectory, null);
    const current = await measureTarball(currentTarball, 'working tree');
    const baseline = await resolveBaseline(options, budget, current, temporaryRoot);
    const evaluations = evaluateMetrics(current, baseline.measurement, budget);
    const passed = evaluations.every((evaluation) => evaluation.status !== 'fail');
    const markdown = renderMarkdown(current, baseline, evaluations, passed);
    const json = `${JSON.stringify({
      schemaVersion: 'zdp.package-size-report/v1',
      generatedAt: new Date().toISOString(),
      passed,
      budget,
      current,
      baseline: baseline.measurement,
      baselineNote: baseline.note,
      evaluations
    }, null, 2)}\n`;

    await writeOptionalFile(options.markdownPath, markdown);
    await writeOptionalFile(options.jsonPath, json);
    process.stdout.write(markdown);

    if (!passed) {
      const failedLabels = evaluations
        .filter((evaluation) => evaluation.status === 'fail')
        .map((evaluation) => evaluation.label)
        .join(', ');
      console.error(`Package size budget exceeded: ${failedLabels}`);
      process.exitCode = 1;
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function parseCliOptions(args: readonly string[]): CliOptions {
  let budgetPath = join(root, '.github', 'package-size-budget.json');
  let markdownPath: string | null = null;
  let jsonPath: string | null = null;
  let baseline: 'auto' | 'none' | string = 'auto';

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === undefined) continue;

    const value = args[index + 1];
    if (argument === '--budget' || argument === '--report' || argument === '--json' || argument === '--baseline') {
      assert.ok(value && !value.startsWith('--'), `Missing value for ${argument}.`);
      index += 1;
    }

    if (argument === '--budget') budgetPath = resolve(root, value as string);
    else if (argument === '--report') markdownPath = resolve(root, value as string);
    else if (argument === '--json') jsonPath = resolve(root, value as string);
    else if (argument === '--baseline') baseline = value as string;
    else throw new Error(`Unknown argument: ${argument}`);
  }

  return { budgetPath, markdownPath, jsonPath, baseline };
}

async function readBudget(path: string): Promise<PackageSizeBudget> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (!isRecord(parsed)) throw new Error('Package size budget must be a JSON object.');
  assert.equal(parsed.schemaVersion, 'zdp.package-size-budget/v1');
  const warnAtPercent = readPositiveNumber(parsed.warnAtPercent, 'warnAtPercent');
  assert.ok(warnAtPercent > 0 && warnAtPercent < 100, 'warnAtPercent must be between 0 and 100.');

  const baselineValue = parsed.baseline;
  if (!isRecord(baselineValue)) throw new Error('baseline must be an object.');
  assert.equal(baselineValue.strategy, 'published-same-version-or-latest');
  if (typeof baselineValue.required !== 'boolean') {
    throw new Error('baseline.required must be a boolean.');
  }

  const limitsValue = parsed.limits;
  if (!isRecord(limitsValue)) throw new Error('limits must be an object.');
  const limits = Object.fromEntries(
    metricDefinitions.map(({ key }) => [key, readPositiveInteger(limitsValue[key], `limits.${key}`)])
  ) as Record<MetricKey, number>;

  const expectedKeys = new Set(metricDefinitions.map(({ key }) => key));
  for (const key of Object.keys(limitsValue)) {
    assert.ok(expectedKeys.has(key as MetricKey), `Unknown package size metric: ${key}`);
  }

  return {
    schemaVersion: 'zdp.package-size-budget/v1',
    warnAtPercent,
    baseline: {
      strategy: 'published-same-version-or-latest',
      required: baselineValue.required
    },
    limits
  };
}

async function resolveBaseline(
  options: CliOptions,
  budget: PackageSizeBudget,
  current: PackageMeasurement,
  temporaryRoot: string
): Promise<BaselineResult> {
  if (options.baseline === 'none') {
    return { measurement: null, note: 'Published baseline comparison was disabled.' };
  }

  const requestedSpecs = options.baseline === 'auto'
    ? [`${current.packageName}@${current.packageVersion}`, `${current.packageName}@latest`]
    : [options.baseline];
  const specs = [...new Set(requestedSpecs)];
  const failures: string[] = [];

  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index];
    if (spec === undefined) continue;

    const directory = join(temporaryRoot, `baseline-${index}`);
    await mkdir(directory);

    try {
      const tarball = await packPackage(root, directory, spec);
      return {
        measurement: await measureTarball(tarball, spec),
        note: index === 0 ? null : `Exact version was unavailable; compared against ${spec}.`
      };
    } catch (error: unknown) {
      failures.push(`${spec}: unavailable`);
      console.warn(`Published package baseline ${spec} is unavailable: ${formatError(error)}`);
    }
  }

  const note = `Published baseline unavailable. ${failures.join(' | ')}`;
  if (budget.baseline.required) throw new Error(note);
  return { measurement: null, note };
}

async function writeOptionalFile(path: string | null, content: string): Promise<void> {
  if (path === null) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

function readPositiveInteger(value: unknown, field: string): number {
  assert.ok(Number.isSafeInteger(value) && (value as number) > 0, `${field} must be a positive integer.`);
  return value as number;
}

function readPositiveNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatError(error: unknown): string {
  const value = error instanceof Error ? error.message : String(error);
  const collapsed = value.replaceAll(/\s+/g, ' ').trim();
  return collapsed.length > 500 ? `${collapsed.slice(0, 499)}…` : collapsed;
}

await main().catch((error: unknown) => {
  console.error(formatError(error));
  process.exitCode = 1;
});
