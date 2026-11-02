import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const policy = Object.freeze({ attempts: 3, timeoutMs: 5000, backoffMs: 250 });
const transientStatuses = new Set([408, 429, 500, 502, 503, 504]);

class GitHubResponseError extends Error {
  constructor(status) {
    super(`GitHub release lookup returned HTTP ${status}.`);
    this.status = status;
  }
}

async function readOnce(url, token, request, signal, timeoutMs) {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  let rejectAbort;
  const aborted = new Promise((_, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(controller.signal.reason);
  controller.signal.addEventListener('abort', onAbort, { once: true });
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException(
    `GitHub release lookup exceeded ${timeoutMs}ms`, 'TimeoutError'
  )), timeoutMs);
  try {
    signal?.throwIfAborted();
    return await Promise.race([
      (async () => {
        const response = await request(url, {
          method: 'GET', redirect: 'error', signal: controller.signal,
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
        });
        return { status: response.status, text: await response.text() };
      })(),
      aborted
    ]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
    controller.signal.removeEventListener('abort', onAbort);
  }
}

/** GET-only gate: authentication and service failures never authorize a write. */
export async function readGitHubReleaseTag(repository, tag, {
  token = process.env.GH_TOKEN,
  apiUrl = process.env.GITHUB_API_URL ?? 'https://api.github.com',
  request = fetch,
  sleep = (ms, signal) => delay(ms, undefined, { signal }),
  signal,
  timeoutMs = policy.timeoutMs
} = {}) {
  signal?.throwIfAborted();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '') || typeof tag !== 'string' || !tag) {
    throw new Error('Repository owner/name and release tag are required.');
  }
  if (typeof token !== 'string' || !token.trim()) throw new Error('GH_TOKEN is required for release lookup.');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647) {
    throw new RangeError('Release lookup timeout must be a positive timer-safe integer.');
  }
  const url = `${apiUrl.replace(/\/$/, '')}/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`;
  for (let attempt = 0; attempt < policy.attempts; attempt++) {
    signal?.throwIfAborted();
    try {
      const response = await readOnce(url, token, request, signal, timeoutMs);
      signal?.throwIfAborted();
      if (response.status === 404) return null;
      if (response.status !== 200) throw new GitHubResponseError(response.status);
      const release = JSON.parse(response.text);
      if (release?.tag_name !== tag) throw new Error('GitHub returned unexpected release metadata.');
      return release.tag_name;
    } catch (cause) {
      if (signal?.aborted) throw signal.reason;
      const retryable = cause instanceof TypeError || cause?.name === 'TimeoutError' ||
        (cause instanceof GitHubResponseError && transientStatuses.has(cause.status));
      if (!retryable || attempt === policy.attempts - 1) {
        throw new Error(`GitHub release lookup failed after ${attempt + 1} attempt(s).`, { cause });
      }
      try {
        await sleep(policy.backoffMs * 2 ** attempt, signal);
      } catch (cause) {
        if (signal?.aborted) throw signal.reason;
        throw new Error('GitHub release retry delay failed.', { cause });
      }
    }
  }
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
