import assert from 'node:assert/strict';
import { appendFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

type ReleaseBump = 'patch' | 'minor' | 'major';

interface ReleaseFragment {
  readonly fileName: string;
  readonly bump: ReleaseBump;
  readonly body: string;
}

interface PackageJson {
  version?: unknown;
  [key: string]: unknown;
}

interface PrepareOptions {
  readonly githubOutputPath: string | null;
  readonly releaseNotesPath: string | null;
}

interface ChangelogParts {
  readonly prefix: string;
  readonly unreleasedBody: string;
  readonly history: string;
}

const root = fileURLToPath(new URL('..', import.meta.url));
const changesDirectory = join(root, '.changes');
const changeGuidePath = join(changesDirectory, 'README.md');
const packageJsonPath = join(root, 'package.json');
const changelogPath = join(root, 'CHANGELOG.md');
const fragmentPlaceholder = '- Describe the consumer-visible change.';
const bumpRank: Readonly<Record<ReleaseBump, number>> = {
  patch: 0,
  minor: 1,
  major: 2
};

await main(process.argv.slice(2));

async function main(args: readonly string[]): Promise<void> {
  const command = args[0];

  switch (command) {
    case 'add':
      await addFragment(args.slice(1));
      return;
    case 'check':
      await checkReleaseChanges();
      return;
    case 'prepare':
      await prepareRelease(parsePrepareOptions(args.slice(1)));
      return;
    case 'self-test':
      runSelfTest();
      return;
    default:
      throw new Error(
        'Usage: release-changes.ts <add|check|prepare|self-test>\n' +
          '  add <patch|minor|major> <lowercase-slug>\n' +
          '  prepare [--github-output <path>] [--release-notes <path>]'
      );
  }
}

async function addFragment(args: readonly string[]): Promise<void> {
  const bump = parseBump(args[0], 'Release bump');
  const slug = args[1];

  if (args.length !== 2 || slug === undefined || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Usage: release-changes.ts add <patch|minor|major> <lowercase-slug>.');
  }

  await mkdir(changesDirectory, { recursive: true });
  const fragmentPath = join(changesDirectory, `${slug}.md`);
  const content = `---\nbump: ${bump}\n---\n\n${fragmentPlaceholder}\n`;

  await writeFile(fragmentPath, content, { encoding: 'utf8', flag: 'wx' });
  console.log(`Created .changes/${slug}.md. Replace the placeholder before committing.`);
}

async function checkReleaseChanges(): Promise<void> {
  const packageJson = await readPackageJson();
  const currentVersion = readPackageVersion(packageJson);
  const changelog = normalizeNewlines(await readFile(changelogPath, 'utf8'));
  const fragments = await readFragments();

  assertChangeGuide(await readFile(changeGuidePath, 'utf8'));
  validateCurrentReleaseSection(changelog, currentVersion);

  if (fragments.length > 0) {
    const nextVersion = bumpVersion(currentVersion, selectHighestBump(fragments));
    assert.ok(
      !new RegExp(`^## ${escapeRegExp(nextVersion)}(?:\\s|$)`, 'm').test(changelog),
      `CHANGELOG.md already contains the calculated next version ${nextVersion}.`
    );
  }

  console.log(`Release change check passed with ${fragments.length} pending fragment(s).`);
}

async function prepareRelease(options: PrepareOptions): Promise<void> {
  const packageJson = await readPackageJson();
  const currentVersion = readPackageVersion(packageJson);
  const changelog = normalizeNewlines(await readFile(changelogPath, 'utf8'));
  const fragments = await readFragments();

  assertChangeGuide(await readFile(changeGuidePath, 'utf8'));
  validateCurrentReleaseSection(changelog, currentVersion);

  if (fragments.length === 0) {
    await writePrepareOutputs(options.githubOutputPath, {
      hasChanges: false,
      version: currentVersion,
      bump: 'patch',
      fragmentCount: 0
    });
    console.log('No release fragments found.');
    return;
  }

  const bump = selectHighestBump(fragments);
  const nextVersion = bumpVersion(currentVersion, bump);
  const changelogParts = splitChangelog(changelog);
  const releaseNotes = joinReleaseNotes(changelogParts.unreleasedBody, fragments);
  const nextChangelog = renderChangelog(changelogParts, nextVersion, releaseNotes);

  assert.ok(
    !new RegExp(`^## ${escapeRegExp(nextVersion)}(?:\\s|$)`, 'm').test(changelog),
    `CHANGELOG.md already contains the calculated next version ${nextVersion}.`
  );

  packageJson.version = nextVersion;
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
  await writeFile(changelogPath, nextChangelog, 'utf8');

  for (const fragment of fragments) {
    await rm(join(changesDirectory, fragment.fileName));
  }

  if (options.releaseNotesPath !== null) {
    await writeFile(options.releaseNotesPath, `${releaseNotes}\n`, 'utf8');
  }

  await writePrepareOutputs(options.githubOutputPath, {
    hasChanges: true,
    version: nextVersion,
    bump,
    fragmentCount: fragments.length
  });

  console.log(`Prepared ${nextVersion} from ${fragments.length} release fragment(s).`);
}

function parsePrepareOptions(args: readonly string[]): PrepareOptions {
  let githubOutputPath: string | null = null;
  let releaseNotesPath: string | null = null;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];

    if (argument === '--github-output' && value !== undefined) {
      githubOutputPath = value;
      index += 1;
      continue;
    }

    if (argument === '--release-notes' && value !== undefined) {
      releaseNotesPath = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown or incomplete prepare option: ${argument ?? '<missing>'}.`);
  }

  return { githubOutputPath, releaseNotesPath };
}

async function readPackageJson(): Promise<PackageJson> {
  const parsed: unknown = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  if (!isRecord(parsed)) {
    throw new Error('package.json must contain an object.');
  }

  return parsed;
}

function readPackageVersion(packageJson: PackageJson): string {
  if (typeof packageJson.version !== 'string') {
    throw new Error('package.json version must be a string.');
  }

  parseVersion(packageJson.version);
  return packageJson.version;
}

async function readFragments(): Promise<readonly ReleaseFragment[]> {
  const entries = await readdir(changesDirectory, { withFileTypes: true });
  const fragmentFileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const fragments: ReleaseFragment[] = [];

  for (const fileName of fragmentFileNames) {
    const source = await readFile(join(changesDirectory, fileName), 'utf8');
    fragments.push(parseFragment(fileName, source));
  }

  return fragments;
}

function parseFragment(fileName: string, source: string): ReleaseFragment {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(fileName)) {
    throw new Error(`${fileName} must use a lowercase kebab-case filename.`);
  }

  const normalized = normalizeNewlines(source);
  const match = /^---\n([\s\S]*?)\n---\n+([\s\S]*?)\s*$/.exec(normalized);

  if (match === null) {
    throw new Error(`${fileName} must contain front matter followed by a Markdown bullet list.`);
  }

  const frontMatter = match[1];
  const body = match[2]?.trim();

  if (frontMatter === undefined || body === undefined) {
    throw new Error(`${fileName} could not be parsed.`);
  }

  const frontMatterLines = frontMatter
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (frontMatterLines.length !== 1) {
    throw new Error(`${fileName} front matter must contain only "bump: patch|minor|major".`);
  }

  const bumpMatch = /^bump:\s*(patch|minor|major)$/.exec(frontMatterLines[0] ?? '');
  if (bumpMatch === null) {
    throw new Error(`${fileName} must declare bump: patch, bump: minor, or bump: major.`);
  }

  const bump = parseBump(bumpMatch[1], `${fileName} bump`);
  validateFragmentBody(fileName, body);

  return { fileName, bump, body };
}

function validateFragmentBody(fileName: string, body: string): void {
  if (body.length === 0) {
    throw new Error(`${fileName} must contain at least one changelog bullet.`);
  }

  if (body.includes(fragmentPlaceholder)) {
    throw new Error(`${fileName} still contains the generated placeholder.`);
  }

  if (/^#{1,2}\s/m.test(body)) {
    throw new Error(`${fileName} must not add top-level changelog headings.`);
  }

  let bulletCount = 0;

  for (const line of body.split('\n')) {
    if (line.trim().length === 0) {
      continue;
    }

    if (/^- \S/.test(line)) {
      bulletCount += 1;
      continue;
    }

    if (/^(?: {2,}|\t)\S/.test(line)) {
      continue;
    }

    throw new Error(`${fileName} must use top-level "- " bullets with indented continuation lines.`);
  }

  if (bulletCount === 0) {
    throw new Error(`${fileName} must contain at least one top-level changelog bullet.`);
  }
}

function selectHighestBump(fragments: readonly ReleaseFragment[]): ReleaseBump {
  let selected: ReleaseBump = 'patch';

  for (const fragment of fragments) {
    if (bumpRank[fragment.bump] > bumpRank[selected]) {
      selected = fragment.bump;
    }
  }

  return selected;
}

function bumpVersion(version: string, bump: ReleaseBump): string {
  const [major, minor, patch] = parseVersion(version);

  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

function parseVersion(version: string): readonly [number, number, number] {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);

  if (match === null) {
    throw new Error(`Unsupported package version ${JSON.stringify(version)}; expected plain major.minor.patch SemVer.`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  if (![major, minor, patch].every(Number.isSafeInteger)) {
    throw new Error(`Package version ${version} exceeds the supported integer range.`);
  }

  return [major, minor, patch];
}

function splitChangelog(changelog: string): ChangelogParts {
  const marker = '## Unreleased';
  const markerMatches = [...changelog.matchAll(/^## Unreleased\s*$/gm)];

  if (markerMatches.length !== 1) {
    throw new Error('CHANGELOG.md must contain exactly one "## Unreleased" heading.');
  }

  const markerIndex = markerMatches[0]?.index;
  if (markerIndex === undefined) {
    throw new Error('CHANGELOG.md Unreleased heading has no source position.');
  }

  const contentStart = markerIndex + marker.length;
  const afterMarker = changelog.slice(contentStart);
  const nextHeading = /^## \d+\.\d+\.\d+(?:\s.*)?$/m.exec(afterMarker);

  if (nextHeading === null || nextHeading.index === undefined) {
    throw new Error('CHANGELOG.md must contain a version heading after "## Unreleased".');
  }

  const historyStart = contentStart + nextHeading.index;

  return {
    prefix: changelog.slice(0, markerIndex).trimEnd(),
    unreleasedBody: changelog.slice(contentStart, historyStart).trim(),
    history: changelog.slice(historyStart).trimStart()
  };
}

function renderChangelog(parts: ChangelogParts, version: string, releaseNotes: string): string {
  return `${parts.prefix}\n\n## Unreleased\n\n## ${version}\n\n${releaseNotes}\n\n${parts.history.trimEnd()}\n`;
}

function joinReleaseNotes(unreleasedBody: string, fragments: readonly ReleaseFragment[]): string {
  const sections = [unreleasedBody, ...fragments.map((fragment) => fragment.body)].filter(
    (section) => section.trim().length > 0
  );

  if (sections.length === 0) {
    throw new Error('Release preparation produced no changelog content.');
  }

  return sections.join('\n');
}

function validateCurrentReleaseSection(changelog: string, currentVersion: string): void {
  splitChangelog(changelog);
  assert.ok(
    new RegExp(`^## ${escapeRegExp(currentVersion)}(?:\\s|$)`, 'm').test(changelog),
    `CHANGELOG.md must contain the current package version ${currentVersion}.`
  );
}

function assertChangeGuide(source: string): void {
  const normalized = normalizeNewlines(source);
  assert.ok(normalized.includes('bump: patch'), '.changes/README.md must document patch fragments.');
  assert.ok(normalized.includes('bump: minor'), '.changes/README.md must document minor fragments.');
  assert.ok(normalized.includes('bump: major'), '.changes/README.md must document major fragments.');
  assert.ok(normalized.includes('release/zdp-design-system'), '.changes/README.md must name the generated release branch.');
}

async function writePrepareOutputs(
  githubOutputPath: string | null,
  output: {
    readonly hasChanges: boolean;
    readonly version: string;
    readonly bump: ReleaseBump;
    readonly fragmentCount: number;
  }
): Promise<void> {
  if (githubOutputPath === null) {
    return;
  }

  const lines = [
    `has_changes=${String(output.hasChanges)}`,
    `version=${output.version}`,
    `bump=${output.bump}`,
    `fragment_count=${output.fragmentCount}`
  ];
  await appendFile(githubOutputPath, `${lines.join('\n')}\n`, 'utf8');
}

function parseBump(value: string | undefined, label: string): ReleaseBump {
  if (value === 'patch' || value === 'minor' || value === 'major') {
    return value;
  }

  throw new Error(`${label} must be patch, minor, or major.`);
}

function normalizeNewlines(source: string): string {
  return source.replace(/\r\n/g, '\n');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function runSelfTest(): void {
  const patchFragment = parseFragment(
    'fix-focus.md',
    '---\r\nbump: patch\r\n---\r\n\r\n- Fixed keyboard focus restoration.\r\n'
  );
  const minorFragment = parseFragment(
    'add-command.md',
    '---\nbump: minor\n---\n\n- Added a public command component.\n  - Preserved keyboard navigation.\n'
  );

  assert.equal(patchFragment.bump, 'patch');
  assert.equal(minorFragment.bump, 'minor');
  assert.equal(selectHighestBump([patchFragment, minorFragment]), 'minor');
  assert.equal(bumpVersion('0.61.0', 'patch'), '0.61.1');
  assert.equal(bumpVersion('0.61.9', 'minor'), '0.62.0');
  assert.equal(bumpVersion('0.61.9', 'major'), '1.0.0');

  const changelog = '# Changelog\n\n## Unreleased\n\n- Existing manual note.\n\n## 0.61.0\n\n- Previous release.\n';
  const parts = splitChangelog(changelog);
  const releaseNotes = joinReleaseNotes(parts.unreleasedBody, [patchFragment, minorFragment]);
  const rendered = renderChangelog(parts, '0.62.0', releaseNotes);

  assert.match(rendered, /^# Changelog\n\n## Unreleased\n\n## 0\.62\.0\n/m);
  assert.ok(rendered.includes('- Existing manual note.\n- Fixed keyboard focus restoration.'));
  assert.ok(rendered.includes('## 0.61.0\n\n- Previous release.'));
  assert.throws(() => parseFragment('Bad_Name.md', '---\nbump: patch\n---\n\n- Fixed.'), /kebab-case/);
  assert.throws(
    () => parseFragment('placeholder.md', `---\nbump: patch\n---\n\n${fragmentPlaceholder}`),
    /placeholder/
  );
  assert.throws(() => parseFragment('heading.md', '---\nbump: patch\n---\n\n## Added\n'), /headings/);
  assert.throws(() => bumpVersion('1.0.0-beta.1', 'patch'), /plain major\.minor\.patch SemVer/);

  console.log('Release change self-test passed.');
}
