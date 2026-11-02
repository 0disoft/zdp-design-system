import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readGitHubJson } from './github-api-read.mjs';

/** GET-only gate: authentication and service failures never authorize a write. */
export async function readGitHubReleaseTag(repository, tag, options = {}) {
  options.signal?.throwIfAborted();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '') || typeof tag !== 'string' || !tag) {
    throw new Error('Repository owner/name and release tag are required.');
  }
  return readGitHubJson(`/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`, release => {
    if (release?.tag_name !== tag) throw new Error('GitHub returned unexpected release metadata.');
    return release.tag_name;
  }, options);
}

async function main() {
  const controller = new AbortController();
  let exitCode = 1;
  const interrupt = () => { exitCode = 130; controller.abort(new DOMException('Interrupted', 'AbortError')); };
  const terminate = () => { exitCode = 143; controller.abort(new DOMException('Terminated', 'AbortError')); };
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', terminate);
  try {
    const tag = await readGitHubReleaseTag(process.argv[2], process.argv[3], { signal: controller.signal });
    if (tag !== null) process.stdout.write(`${tag}\n`);
  } catch (error) {
    console.error(error);
    process.exitCode = exitCode;
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', terminate);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
