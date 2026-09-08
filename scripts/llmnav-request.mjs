/* llmnav/1 module
id=zdp.design.navigation.request
role=Read bounded navigation requests as data and dispatch them against the fixed design-system repository.
owns=navigation request validation|read-only navigation dispatch
excludes=shell execution|repository selection|source mutation
search=free query|JSON request|자유 질의|검색 요청
invariant=Request data cannot choose an executable, repository root, or write operation.
stability=contract
*/

import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const requestDirectory = '.llmnav/state/requests';
const maximumBytes = 8192;

export function validateRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object.');
  const field = value.action === 'query' ? 'task' : ['show', 'context'].includes(value.action) ? 'id' : null;
  if (!field) throw new Error('Only query, show, and context are supported.');
  if (Object.keys(value).some((key) => !['action', field].includes(key))) throw new Error('Unknown request field.');
  const text = value[field];
  const limit = field === 'task' ? 2000 : 200;
  if (typeof text !== 'string' || !text.trim() || text.length > limit || text.includes('\0')) {
    throw new Error(`Expected non-empty ${field} of at most ${limit} characters without NUL.`);
  }
  return { action: value.action, [field]: text.trim() };
}

export function requestName(input) {
  if (typeof input !== 'string') throw new Error('Expected a repository-relative request filename.');
  const match = /^\.llmnav[\\/]state[\\/]requests[\\/]([a-zA-Z0-9][a-zA-Z0-9_-]{0,79}\.json)$/.exec(input);
  if (!match || /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])\.json$/i.test(match[1])) {
    throw new Error('Request must be one JSON file directly inside .llmnav/state/requests.');
  }
  return match[1];
}

// The checkout and its ancestors are trusted local files, not an OS sandbox.
// Reject static link redirection and read bounded bytes through one verified handle.
export async function readRequest(root, input) {
  const name = requestName(input);
  const base = await realpath(root);
  let parent = base;
  for (const part of ['.llmnav', 'state', 'requests']) {
    parent = join(parent, part);
    const info = await lstat(parent);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Request directories must not be links.');
  }
  const path = join(parent, name);
  const expected = await lstat(path);
  if (!expected.isFile() || expected.isSymbolicLink() || expected.nlink !== 1) throw new Error('Request must be an unlinked regular file.');
  const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
  try {
    const actual = await handle.stat();
    if (!actual.isFile() || actual.nlink !== 1 || actual.dev !== expected.dev || actual.ino !== expected.ino) {
      throw new Error('Request identity changed.');
    }
    if (actual.size > maximumBytes) throw new Error('Request exceeds 8192 bytes.');
    const bytes = Buffer.alloc(maximumBytes + 1);
    let size = 0;
    while (size < bytes.length) {
      const read = await handle.read(bytes, size, bytes.length - size, size);
      if (!read.bytesRead) break;
      size += read.bytesRead;
    }
    if (size > maximumBytes) throw new Error('Request exceeds 8192 bytes.');
    return validateRequest(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, size))));
  } finally {
    await handle.close();
  }
}

export async function executeRequest(value, execute) {
  const request = validateRequest(value);
  const input = request.action === 'query'
    ? { task: request.task, top: 5 }
    : request.action === 'show'
      ? { id: request.id }
      : { id: request.id, depth: 1, budget: 2500, maxEdges: 24 };
  return execute(repositoryRoot, `llmnav_${request.action}`, input);
}

async function main() {
  if (process.argv.length !== 3) throw new Error('Expected exactly one request-file argument.');
  const request = await readRequest(repositoryRoot, process.argv[2]);
  const { executeAgentOperation } = await import('../../../../hobby/opensource/llmnav/src/index.js');
  const result = await executeRequest(request, executeAgentOperation);
  const output = JSON.stringify(result, null, 2);
  if (Buffer.byteLength(output) > 60000) throw new Error('Navigation result exceeds the output limit.');
  console.log(output);
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
