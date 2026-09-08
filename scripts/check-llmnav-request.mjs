import assert from 'node:assert/strict';
import { link, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { executeRequest, readRequest, repositoryRoot, requestName, validateRequest } from './llmnav-request.mjs';

test('natural language and shell-looking text stay query data with a fixed root', async () => {
  const task = '--root ../../elsewhere; echo "안녕" && $(whoami) `x`';
  let call;
  const result = await executeRequest({ action: 'query', task }, async (...args) => {
    call = args;
    return { ok: true };
  });
  assert.equal(result.ok, true);
  assert.deepEqual(call, [repositoryRoot, 'llmnav_query', { task, top: 5 }]);
});

test('show and context accept unseen IDs but keep context bounds fixed', async () => {
  for (const action of ['show', 'context']) {
    let call;
    await executeRequest({ action, id: 'future.component.boundary' }, async (...args) => { call = args; });
    assert.equal(call[0], repositoryRoot);
    assert.equal(call[1], `llmnav_${action}`);
    assert.equal(call[2].id, 'future.component.boundary');
    if (action === 'context') assert.deepEqual(call[2], { id: 'future.component.boundary', depth: 1, budget: 2500, maxEdges: 24 });
  }
});

test('unknown operations, root overrides and excessive inputs fail before dispatch', () => {
  for (const input of [null, [], { action: 'generate' }, { action: 'query', task: 'x', root: '.' },
    { action: 'query', task: 'x', top: 500 }, { action: 'query', task: '' },
    { action: 'query', task: 'x'.repeat(2001) }, { action: 'query', task: 'a\0b' },
    { action: 'show', id: 'x'.repeat(201) }]) assert.throws(() => validateRequest(input));
});

test('request paths reject aliases and traversal instead of normalizing them', () => {
  assert.equal(requestName('.llmnav/state/requests/task-1.json'), 'task-1.json');
  assert.equal(requestName('.llmnav\\state\\requests\\task-1.json'), 'task-1.json');
  for (const path of ['../x.json', '.llmnav/state/requests/../x.json', '/tmp/x.json', 'C:x.json',
    '.llmnav/state/requests/NUL.json', '.llmnav/state/requests/CON.json', '.llmnav/state/requests/x.json:stream',
    '.llmnav/state/requests/x.json ', '.llmnav/state/requests/%2e%2e.json', '.llmnav/state/requests/nested/x.json']) {
    assert.throws(() => requestName(path));
  }
});

test('bounded file loading rejects oversized, invalid and linked files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'zdp-navigation-request-'));
  const directory = join(root, '.llmnav/state/requests');
  try {
    await mkdir(directory, { recursive: true });
    const path = join(directory, 'task.json');
    await writeFile(path, JSON.stringify({ action: 'query', task: '처음 보는 한국어 증상' }));
    assert.deepEqual(await readRequest(root, '.llmnav/state/requests/task.json'), { action: 'query', task: '처음 보는 한국어 증상' });
    await writeFile(join(directory, 'large.json'), ' '.repeat(8193));
    await assert.rejects(readRequest(root, '.llmnav/state/requests/large.json'), /8192 bytes/);
    await writeFile(join(directory, 'invalid.json'), Buffer.from([0xff]));
    await assert.rejects(readRequest(root, '.llmnav/state/requests/invalid.json'));
    await link(path, join(directory, 'linked.json'));
    await assert.rejects(readRequest(root, '.llmnav/state/requests/linked.json'), /regular file/);
    await mkdir(join(root, 'outside'));
    await symlink(join(root, 'outside'), join(directory, 'linked-directory.json'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(readRequest(root, '.llmnav/state/requests/linked-directory.json'), /regular file/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
