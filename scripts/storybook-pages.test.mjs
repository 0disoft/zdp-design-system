import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptPath = fileURLToPath(new URL('./storybook-pages.mjs', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const repository = '0disoft/zdp-design-system';

await test('publishes main and PR Storybooks, stays idempotent, and cleans only the PR preview', async () => {
  const root = await mkdtemp(join(tmpdir(), 'zdp-storybook-pages-test-'));

  try {
    const remotePath = join(root, 'remote.git');
    run('git', ['init', '--bare', remotePath]);

    const mainStorybookPath = join(root, 'main-storybook');
    await writeStorybook(mainStorybookPath, 'main');
    const mainOutputPath = join(root, 'main-output.txt');

    runNode(
      [
        'publish',
        '--storybook', mainStorybookPath,
        '--repository', repository,
        '--source-sha', 'a'.repeat(40),
        '--kind', 'main',
        '--remote-url', remotePath
      ],
      { GITHUB_OUTPUT: mainOutputPath }
    );

    const mainOutput = readOutput(await readFile(mainOutputPath, 'utf8'));
    assert.equal(mainOutput.changed, 'true');
    assert.equal(mainOutput.target_path, '.');
    assert.match(showFile(remotePath, 'index.html'), /main/);
    assert.equal(objectExists(remotePath, '.nojekyll'), true);

    const repeatedMainOutputPath = join(root, 'main-repeat-output.txt');
    runNode(
      [
        'publish',
        '--storybook', mainStorybookPath,
        '--repository', repository,
        '--source-sha', 'a'.repeat(40),
        '--kind', 'main',
        '--remote-url', remotePath
      ],
      { GITHUB_OUTPUT: repeatedMainOutputPath }
    );
    assert.equal(readOutput(await readFile(repeatedMainOutputPath, 'utf8')).changed, 'false');

    const pullRequestStorybookPath = join(root, 'pr-storybook');
    await writeStorybook(pullRequestStorybookPath, 'pull request');
    const pullRequestOutputPath = join(root, 'pr-output.txt');

    runNode(
      [
        'publish',
        '--storybook', pullRequestStorybookPath,
        '--repository', repository,
        '--source-sha', 'b'.repeat(40),
        '--kind', 'pull-request',
        '--pr-number', '17',
        '--remote-url', remotePath
      ],
      { GITHUB_OUTPUT: pullRequestOutputPath }
    );

    const pullRequestOutput = readOutput(await readFile(pullRequestOutputPath, 'utf8'));
    assert.equal(pullRequestOutput.kind, 'pull-request');
    assert.equal(pullRequestOutput.pr_number, '17');
    assert.equal(pullRequestOutput.target_path, 'pr-preview/pr-17');
    assert.match(showFile(remotePath, 'index.html'), /main/);
    assert.match(showFile(remotePath, 'pr-preview/pr-17/index.html'), /pull request/);
    assert.match(showFile(remotePath, 'pr-preview/index.html'), /Pull request #17/);

    await writeStorybook(pullRequestStorybookPath, 'pull request updated');
    runNode([
      'publish',
      '--storybook', pullRequestStorybookPath,
      '--repository', repository,
      '--source-sha', 'c'.repeat(40),
      '--kind', 'pull-request',
      '--pr-number', '17',
      '--remote-url', remotePath
    ]);
    assert.match(showFile(remotePath, 'pr-preview/pr-17/index.html'), /pull request updated/);
    assert.match(showFile(remotePath, 'index.html'), /main/);

    const cleanupOutputPath = join(root, 'cleanup-output.txt');
    runNode(
      [
        'cleanup',
        '--repository', repository,
        '--pr-number', '17',
        '--remote-url', remotePath
      ],
      { GITHUB_OUTPUT: cleanupOutputPath }
    );

    const cleanupOutput = readOutput(await readFile(cleanupOutputPath, 'utf8'));
    assert.equal(cleanupOutput.changed, 'true');
    assert.equal(cleanupOutput.removed, 'true');
    assert.match(showFile(remotePath, 'index.html'), /main/);
    assert.match(showFile(remotePath, 'pr-preview/index.html'), /No active pull request previews/);
    assert.equal(objectExists(remotePath, 'pr-preview/pr-17/index.html'), false);

    const repeatedCleanupOutputPath = join(root, 'cleanup-repeat-output.txt');
    runNode(
      [
        'cleanup',
        '--repository', repository,
        '--pr-number', '17',
        '--remote-url', remotePath
      ],
      { GITHUB_OUTPUT: repeatedCleanupOutputPath }
    );
    const repeatedCleanupOutput = readOutput(await readFile(repeatedCleanupOutputPath, 'utf8'));
    assert.equal(repeatedCleanupOutput.changed, 'false');
    assert.equal(repeatedCleanupOutput.removed, 'false');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

await test('rejects reserved deployment paths in downloaded Storybook artifacts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'zdp-storybook-pages-reserved-test-'));

  try {
    const remotePath = join(root, 'remote.git');
    run('git', ['init', '--bare', remotePath]);
    const storybookPath = join(root, 'storybook');
    await writeStorybook(storybookPath, 'unsafe');
    await mkdir(join(storybookPath, 'pr-preview'));

    const result = runResult(process.execPath, [
      scriptPath,
      'publish',
      '--storybook', storybookPath,
      '--repository', repository,
      '--source-sha', 'd'.repeat(40),
      '--kind', 'main',
      '--remote-url', remotePath
    ]);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /reserved top-level entry pr-preview/);
    assert.equal(objectExists(remotePath, 'index.html'), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

await test(
  'rejects symbolic links in downloaded Storybook artifacts',
  { skip: process.platform === 'win32' },
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'zdp-storybook-pages-symlink-test-'));

    try {
      const remotePath = join(root, 'remote.git');
      run('git', ['init', '--bare', remotePath]);
      const storybookPath = join(root, 'storybook');
      await writeStorybook(storybookPath, 'unsafe');
      await symlink(join(storybookPath, 'index.html'), join(storybookPath, 'linked-index.html'));

      const result = runResult(process.execPath, [
        scriptPath,
        'publish',
        '--storybook', storybookPath,
        '--repository', repository,
        '--source-sha', 'e'.repeat(40),
        '--kind', 'main',
        '--remote-url', remotePath
      ]);

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /must not contain symbolic link/);
      assert.equal(objectExists(remotePath, 'index.html'), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
);

await test('keeps privileged Pages workflows on trusted code and immutable actions', async () => {
  const ciWorkflow = await readFile(join(repositoryRoot, '.github/workflows/design-system.yml'), 'utf8');
  const publishWorkflow = await readFile(
    join(repositoryRoot, '.github/workflows/storybook-pages-publish.yml'),
    'utf8'
  );
  const cleanupWorkflow = await readFile(
    join(repositoryRoot, '.github/workflows/storybook-pages-cleanup.yml'),
    'utf8'
  );

  assert.match(ciWorkflow, /permissions:\n  contents: read/);
  assert.match(ciWorkflow, /name: Upload Storybook Pages artifact/);
  assert.match(ciWorkflow, /path: storybook-static\//);
  assert.doesNotMatch(ciWorkflow, /contents: write/);

  assert.match(publishWorkflow, /workflow_run:/);
  assert.match(publishWorkflow, /head_repository\.full_name == github\.repository/);
  assert.match(publishWorkflow, /ref: main/);
  assert.match(publishWorkflow, /run-id: \$\{\{ github\.event\.workflow_run\.id \}\}/);
  assert.ok(publishWorkflow.includes('actions/runs/$WORKFLOW_RUN_ID/artifacts'));
  assert.ok(publishWorkflow.includes("steps.artifact.outputs.available == 'true'"));
  assert.match(publishWorkflow, /pr_state=.*gh api/);
  assert.doesNotMatch(publishWorkflow, /pull_request_target:/);
  assert.doesNotMatch(publishWorkflow, /ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);

  assert.match(cleanupWorkflow, /pull_request_target:/);
  assert.match(cleanupWorkflow, /types:\n      - closed/);
  assert.match(cleanupWorkflow, /ref: main/);
  assert.doesNotMatch(cleanupWorkflow, /github\.event\.pull_request\.head\.sha/);

  const publishStep = publishWorkflow.slice(
    publishWorkflow.indexOf('      - name: Publish Storybook tree'),
    publishWorkflow.indexOf('      - name: Resolve Pages URL')
  );
  const cleanupStep = cleanupWorkflow.slice(
    cleanupWorkflow.indexOf('      - name: Remove Storybook preview'),
    cleanupWorkflow.indexOf('      - name: Mark preview comment as removed')
  );
  assert.ok(publishStep.includes('GH_TOKEN: ${{ github.token }}'));
  assert.ok(cleanupStep.includes('GH_TOKEN: ${{ github.token }}'));

  for (const workflow of [ciWorkflow, publishWorkflow, cleanupWorkflow]) {
    const actionReferences = [...workflow.matchAll(/^\s+(?:-\s+)?uses:\s+([^\s#]+)/gm)]
      .flatMap((match) => match[1] ? [match[1]] : []);
    assert.ok(actionReferences.length > 0);
    assert.ok(
      actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)),
      `Workflow action references must be pinned: ${actionReferences.join(', ')}`
    );
  }
});

async function writeStorybook(path, label) {
  await mkdir(join(path, 'assets'), { recursive: true });
  await writeFile(join(path, 'index.html'), `<html><body>${label}</body></html>\n`, 'utf8');
  await writeFile(join(path, 'iframe.html'), `<html><body>${label} iframe</body></html>\n`, 'utf8');
  await writeFile(join(path, 'assets/asset.txt'), `${label}\n`, 'utf8');
}

function runNode(argumentsList, extraEnvironment = {}) {
  return run(process.execPath, [scriptPath, ...argumentsList], extraEnvironment);
}

function showFile(remotePath, path) {
  return run('git', [`--git-dir=${remotePath}`, 'show', `gh-pages:${path}`]).stdout;
}

function objectExists(remotePath, path) {
  return runResult('git', [
    `--git-dir=${remotePath}`,
    'cat-file',
    '-e',
    `gh-pages:${path}`
  ]).status === 0;
}

function readOutput(source) {
  return Object.fromEntries(
    source
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
}

function run(command, argumentsList, extraEnvironment = {}) {
  const result = runResult(command, argumentsList, extraEnvironment);
  if (result.status !== 0) {
    throw new Error(
      `${command} ${argumentsList.join(' ')} failed:\n${result.stderr || result.stdout || result.error?.message}`
    );
  }
  return result;
}

function runResult(command, argumentsList, extraEnvironment = {}) {
  return spawnSync(command, argumentsList, {
    encoding: 'utf8',
    env: {
      ...process.env,
      ...extraEnvironment,
      GIT_TERMINAL_PROMPT: '0'
    },
    shell: false
  });
}
