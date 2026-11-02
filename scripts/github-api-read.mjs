import { setTimeout as delay } from 'node:timers/promises';

const policy = Object.freeze({ attempts: 3, timeoutMs: 5000, backoffMs: 250 });
const transientStatuses = new Set([408, 429, 500, 502, 503, 504]);

class GitHubResponseError extends Error {
  constructor(status) {
    super(`GitHub API lookup returned HTTP ${status}.`);
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
    `GitHub API lookup exceeded ${timeoutMs}ms`, 'TimeoutError'
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
export async function readGitHubJson(endpoint, validate, {
  token = process.env.GH_TOKEN,
  apiUrl = process.env.GITHUB_API_URL ?? 'https://api.github.com',
  request = fetch,
  sleep = (ms, signal) => delay(ms, undefined, { signal }),
  signal,
  timeoutMs = policy.timeoutMs
} = {}) {
  signal?.throwIfAborted();
  if (typeof token !== 'string' || !token.trim()) throw new Error('GH_TOKEN is required for GitHub API lookup.');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647) {
    throw new RangeError('GitHub API timeout must be a positive timer-safe integer.');
  }
  const url = `${apiUrl.replace(/\/$/, '')}${endpoint}`;
  for (let attempt = 0; attempt < policy.attempts; attempt++) {
    signal?.throwIfAborted();
    try {
      const response = await readOnce(url, token, request, signal, timeoutMs);
      signal?.throwIfAborted();
      if (response.status === 404) return null;
      if (response.status !== 200) throw new GitHubResponseError(response.status);
      return validate(JSON.parse(response.text));
    } catch (cause) {
      if (signal?.aborted) throw signal.reason;
      const retryable = cause instanceof TypeError || cause?.name === 'TimeoutError' ||
        (cause instanceof GitHubResponseError && transientStatuses.has(cause.status));
      if (!retryable || attempt === policy.attempts - 1) {
        throw new Error(`GitHub API lookup failed after ${attempt + 1} attempt(s).`, { cause });
      }
      try {
        await sleep(policy.backoffMs * 2 ** attempt, signal);
      } catch (cause) {
        if (signal?.aborted) throw signal.reason;
        throw new Error('GitHub API retry delay failed.', { cause });
      }
    }
  }
}
