#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  appendFile,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';

const PAGES_BRANCH = 'gh-pages';
const PREVIEW_ROOT = 'pr-preview';
const RESERVED_ARTIFACT_ENTRIES = new Set(['.git', '.nojekyll', 'CNAME', PREVIEW_ROOT]);
const BOT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9][0-9]*$/;

const [command, ...rawArguments] = process.argv.slice(2);
const argumentsByName = parseArguments(rawArguments);

if (command === 'publish') {
  await publishStorybook(argumentsByName);
} else if (command === 'cleanup') {
  await cleanupPreview(argumentsByName);
} else {
  throw new Error('Usage: node scripts/storybook-pages.mjs <publish|cleanup> [options]');
}

async function publishStorybook(argumentsMap) {
  const repository = parseRepository(requireArgument(argumentsMap, 'repository'));
  const storybookPath = resolve(requireArgument(argumentsMap, 'storybook'));
  const sourceSha = parseSha(requireArgument(argumentsMap, 'source-sha'));
  const kind = requireArgument(argumentsMap, 'kind');
  const remoteUrl = optionalArgument(argumentsMap, 'remote-url') ?? `https://github.com/${repository}.git`;

  let pullRequestNumber = null;
  let targetPath = '.';
  let commitMessage = `docs(storybook): publish main ${sourceSha.slice(0, 12)}`;

  if (kind === 'pull-request') {
    pullRequestNumber = parsePositiveInteger(requireArgument(argumentsMap, 'pr-number'));
    targetPath = `${PREVIEW_ROOT}/pr-${pullRequestNumber}`;
    commitMessage = `docs(storybook): publish PR ${pullRequestNumber}`;
  } else if (kind !== 'main') {
    throw new Error(`Unsupported Storybook Pages deployment kind ${kind}.`);
  }

  await validateStorybookDirectory(storybookPath);
  const checkout = await checkoutPagesBranch(remoteUrl, false);

  try {
    if (kind === 'main') {
      await replaceMainSite(checkout.path, storybookPath);
    } else {
      await replacePreviewSite(checkout.path, targetPath, storybookPath);
    }

    await writeFile(join(checkout.path, '.nojekyll'), '', 'utf8');
    await writePreviewIndex(checkout.path);
    const changed = await commitAndPush(checkout.path, commitMessage);

    await writeOutputs({
      changed: String(changed),
      kind,
      pr_number: pullRequestNumber === null ? '' : String(pullRequestNumber),
      source_sha: sourceSha,
      target_path: targetPath
    });
  } finally {
    await rm(checkout.path, { recursive: true, force: true });
  }
}

async function cleanupPreview(argumentsMap) {
  const repository = parseRepository(requireArgument(argumentsMap, 'repository'));
  const pullRequestNumber = parsePositiveInteger(requireArgument(argumentsMap, 'pr-number'));
  const remoteUrl = optionalArgument(argumentsMap, 'remote-url') ?? `https://github.com/${repository}.git`;
  const checkout = await checkoutPagesBranch(remoteUrl, true);

  if (!checkout.branchExists) {
    await rm(checkout.path, { recursive: true, force: true });
    await writeOutputs({
      changed: 'false',
      pr_number: String(pullRequestNumber),
      removed: 'false'
    });
    return;
  }

  try {
    const previewPath = resolveInside(checkout.path, `${PREVIEW_ROOT}/pr-${pullRequestNumber}`);
    const removed = existsSync(previewPath);

    if (removed) {
      await rm(previewPath, { recursive: true, force: true });
    }

    await writePreviewIndex(checkout.path);
    const changed = await commitAndPush(
      checkout.path,
      `docs(storybook): remove PR ${pullRequestNumber} preview`
    );

    await writeOutputs({
      changed: String(changed),
      pr_number: String(pullRequestNumber),
      removed: String(removed)
    });
  } finally {
    await rm(checkout.path, { recursive: true, force: true });
  }
}

async function validateStorybookDirectory(storybookPath) {
  const directoryStat = await lstat(storybookPath);
  if (!directoryStat.isDirectory()) {
    throw new Error(`${storybookPath} must be a Storybook directory.`);
  }

  for (const entry of await readdir(storybookPath, { withFileTypes: true })) {
    if (RESERVED_ARTIFACT_ENTRIES.has(entry.name)) {
      throw new Error(`Storybook artifact must not contain reserved top-level entry ${entry.name}.`);
    }
  }

  for (const requiredFile of ['index.html', 'iframe.html']) {
    const requiredPath = resolveInside(storybookPath, requiredFile);
    const requiredStat = await lstat(requiredPath);
    if (!requiredStat.isFile()) {
      throw new Error(`Storybook artifact is missing regular file ${requiredFile}.`);
    }
  }

  await assertSafeTree(storybookPath, storybookPath);
}

async function assertSafeTree(rootPath, currentPath) {
  for (const entry of await readdir(currentPath, { withFileTypes: true })) {
    const entryPath = resolveInside(rootPath, relative(rootPath, join(currentPath, entry.name)));
    const stat = await lstat(entryPath);

    if (stat.isSymbolicLink()) {
      throw new Error(`Storybook artifact must not contain symbolic link ${entryPath}.`);
    }

    if (stat.isDirectory()) {
      await assertSafeTree(rootPath, entryPath);
    } else if (!stat.isFile()) {
      throw new Error(`Storybook artifact contains unsupported filesystem entry ${entryPath}.`);
    }
  }
}

async function checkoutPagesBranch(remoteUrl, allowMissingBranch) {
  const checkoutPath = await mkdtemp(join(tmpdir(), 'zdp-storybook-pages-'));
  runGit(checkoutPath, ['init']);
  runGit(checkoutPath, ['remote', 'add', 'origin', remoteUrl]);

  const probe = runGitResult(checkoutPath, [
    'ls-remote',
    '--exit-code',
    'origin',
    `refs/heads/${PAGES_BRANCH}`
  ]);

  if (probe.status === 0) {
    runGit(checkoutPath, ['fetch', '--depth=1', 'origin', `refs/heads/${PAGES_BRANCH}`]);
    runGit(checkoutPath, ['checkout', '-B', PAGES_BRANCH, 'FETCH_HEAD']);
    return { path: checkoutPath, branchExists: true };
  }

  if (probe.status !== 2) {
    await rm(checkoutPath, { recursive: true, force: true });
    throw new Error(formatGitFailure(probe, `Could not inspect ${PAGES_BRANCH}.`));
  }

  if (allowMissingBranch) {
    return { path: checkoutPath, branchExists: false };
  }

  runGit(checkoutPath, ['checkout', '--orphan', PAGES_BRANCH]);
  return { path: checkoutPath, branchExists: false };
}

async function replaceMainSite(pagesRoot, storybookPath) {
  const preservedNames = new Set(['.git', 'CNAME', PREVIEW_ROOT]);

  for (const entry of await readdir(pagesRoot, { withFileTypes: true })) {
    if (!preservedNames.has(entry.name)) {
      await rm(resolveInside(pagesRoot, entry.name), { recursive: true, force: true });
    }
  }

  await copyDirectoryContents(storybookPath, pagesRoot);
}

async function replacePreviewSite(pagesRoot, targetPath, storybookPath) {
  const resolvedTargetPath = resolveInside(pagesRoot, targetPath);
  await rm(resolvedTargetPath, { recursive: true, force: true });
  await mkdir(resolvedTargetPath, { recursive: true });
  await copyDirectoryContents(storybookPath, resolvedTargetPath);
}

async function copyDirectoryContents(sourcePath, targetPath) {
  for (const entry of await readdir(sourcePath, { withFileTypes: true })) {
    await cp(
      resolveInside(sourcePath, entry.name),
      resolveInside(targetPath, entry.name),
      {
        recursive: entry.isDirectory(),
        errorOnExist: false,
        force: true
      }
    );
  }
}

async function writePreviewIndex(pagesRoot) {
  const previewRootPath = resolveInside(pagesRoot, PREVIEW_ROOT);
  await mkdir(previewRootPath, { recursive: true });

  const previewNumbers = (await readdir(previewRootPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^pr-[1-9][0-9]*$/.test(entry.name))
    .map((entry) => Number(entry.name.slice(3)))
    .sort((left, right) => right - left);

  const previews = previewNumbers.length === 0
    ? '<p>No active pull request previews.</p>'
    : `<ul>${previewNumbers
        .map((number) => `<li><a href="./pr-${number}/">Pull request #${number}</a></li>`)
        .join('')}</ul>`;

  await writeFile(
    join(previewRootPath, 'index.html'),
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Storybook pull request previews</title>
</head>
<body>
  <main>
    <h1>Storybook pull request previews</h1>
    ${previews}
  </main>
</body>
</html>
`,
    'utf8'
  );
}

async function commitAndPush(checkoutPath, commitMessage) {
  runGit(checkoutPath, ['config', 'user.name', 'github-actions[bot]']);
  runGit(checkoutPath, ['config', 'user.email', BOT_EMAIL]);
  runGit(checkoutPath, ['add', '--all']);

  const diff = runGitResult(checkoutPath, ['diff', '--cached', '--quiet']);
  if (diff.status === 0) {
    return false;
  }
  if (diff.status !== 1) {
    throw new Error(formatGitFailure(diff, 'Could not inspect staged Pages changes.'));
  }

  runGit(checkoutPath, ['commit', '-m', commitMessage]);
  runGit(checkoutPath, ['push', 'origin', `HEAD:refs/heads/${PAGES_BRANCH}`]);
  return true;
}

function runGit(checkoutPath, argumentList) {
  const result = runGitResult(checkoutPath, argumentList);
  if (result.status !== 0) {
    throw new Error(formatGitFailure(result, `git ${argumentList.join(' ')} failed.`));
  }
  return result.stdout.trim();
}

function runGitResult(checkoutPath, argumentList) {
  return spawnSync('git', argumentList, {
    cwd: checkoutPath,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    shell: false
  });
}

function formatGitFailure(result, prefix) {
  const detail = (result.stderr || result.stdout || result.error?.message || 'unknown git failure').trim();
  return `${prefix} ${detail}`;
}

function resolveInside(rootPath, relativePath) {
  const normalizedRoot = resolve(rootPath);
  const candidate = resolve(normalizedRoot, relativePath);
  if (candidate !== normalizedRoot && !candidate.startsWith(`${normalizedRoot}${sep}`)) {
    throw new Error(`Path ${relativePath} escapes ${normalizedRoot}.`);
  }
  return candidate;
}

function parseArguments(rawArgs) {
  const parsed = new Map();
  for (let index = 0; index < rawArgs.length; index += 2) {
    const name = rawArgs[index];
    const value = rawArgs[index + 1];
    if (!name?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument sequence near ${String(name)}.`);
    }
    const normalizedName = name.slice(2);
    if (parsed.has(normalizedName)) {
      throw new Error(`Duplicate argument --${normalizedName}.`);
    }
    parsed.set(normalizedName, value);
  }
  return parsed;
}

function requireArgument(argumentsMap, name) {
  const value = argumentsMap.get(name);
  if (value === undefined || value === '') {
    throw new Error(`Missing required argument --${name}.`);
  }
  return value;
}

function optionalArgument(argumentsMap, name) {
  const value = argumentsMap.get(name);
  return value === undefined || value === '' ? null : value;
}

function parseRepository(value) {
  if (!REPOSITORY_PATTERN.test(value)) {
    throw new Error(`Invalid repository ${value}.`);
  }
  return value;
}

function parseSha(value) {
  if (!SHA_PATTERN.test(value)) {
    throw new Error('source-sha must be a lowercase 40-character commit SHA.');
  }
  return value;
}

function parsePositiveInteger(value) {
  if (!POSITIVE_INTEGER_PATTERN.test(value)) {
    throw new Error('pr-number must be a positive integer.');
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error('pr-number exceeds the safe integer range.');
  }
  return parsed;
}

async function writeOutputs(outputs) {
  const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`).join('\n');
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${lines}\n`, 'utf8');
  } else {
    process.stdout.write(`${lines}\n`);
  }
}
