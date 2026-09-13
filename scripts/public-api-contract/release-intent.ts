import { spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { assertGitCommitRef } from './source';
import type { ReleaseBump, ReleaseIntent } from './types';

const releaseBumpRank: Readonly<Record<ReleaseBump, number>> = {
  patch: 0,
  minor: 1,
  major: 2
};

export async function readChangedReleaseIntent(
  baseRef: string,
  repoRoot = process.cwd()
): Promise<ReleaseIntent | null> {
  const root = resolve(repoRoot);
  const normalizedRef = assertGitCommitRef(baseRef);
  assertCommitExists(root, normalizedRef);
  const changesDirectory = join(root, '.changes');
  const entries = await readdir(changesDirectory, { withFileTypes: true });
  const currentFragments = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const changed: Array<{ readonly file: string; readonly bump: ReleaseBump }> = [];

  for (const fileName of currentFragments) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(fileName)) {
      throw new Error(`${fileName} must use a lowercase kebab-case filename.`);
    }
    const path = `.changes/${fileName}`;
    const current = normalizeNewlines(await readFile(join(changesDirectory, fileName), 'utf8'));
    const base = readGitText(root, normalizedRef, path);
    if (base !== null && normalizeNewlines(base) === current) continue;
    changed.push({ file: path, bump: parseReleaseBump(fileName, current) });
  }

  if (changed.length === 0) return null;
  const bump = changed.reduce<ReleaseBump>(
    (selected, item) => releaseBumpRank[item.bump] > releaseBumpRank[selected] ? item.bump : selected,
    'patch'
  );
  return { bump, files: changed.map(({ file }) => file) };
}

function assertCommitExists(root: string, ref: string): void {
  const result = spawnSync('git', ['cat-file', '-e', `${ref}^{commit}`], {
    cwd: root, encoding: 'utf8', shell: false
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Git base commit ${ref} is unavailable.`);
}

function readGitText(root: string, ref: string, path: string): string | null {
  const result = spawnSync('git', ['show', `${ref}:${path}`], {
    cwd: root, encoding: 'utf8', shell: false
  });
  if (result.error) throw result.error;
  return result.status === 0 ? result.stdout : null;
}

function parseReleaseBump(fileName: string, source: string): ReleaseBump {
  const match = /^---\n([\s\S]*?)\n---\n+([\s\S]*?)\s*$/.exec(source);
  if (match === null) {
    throw new Error(`${fileName} must contain front matter followed by a Markdown bullet list.`);
  }
  const frontMatter = match[1]?.split('\n').map((line) => line.trim()).filter(Boolean) ?? [];
  const body = match[2]?.trim() ?? '';
  if (frontMatter.length !== 1) {
    throw new Error(`${fileName} front matter must contain only "bump: patch|minor|major".`);
  }
  const bump = /^bump:\s*(patch|minor|major)$/.exec(frontMatter[0] ?? '')?.[1];
  if (bump !== 'patch' && bump !== 'minor' && bump !== 'major') {
    throw new Error(`${fileName} must declare bump: patch, bump: minor, or bump: major.`);
  }
  if (!body.split('\n').some((line) => /^- \S/.test(line))) {
    throw new Error(`${fileName} must contain at least one top-level changelog bullet.`);
  }
  if (body.includes('- Describe the consumer-visible change.')) {
    throw new Error(`${fileName} still contains the generated placeholder.`);
  }
  return bump;
}

function normalizeNewlines(value: string): string {
  return value.replaceAll('\r\n', '\n');
}
