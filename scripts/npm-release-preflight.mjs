import { setTimeout as delay } from 'node:timers/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const policy = Object.freeze({ timeoutMs: 5000, attempts: 3, backoffMs: 250 });
const transientStatuses = new Set([408, 429, 500, 502, 503, 504]);

class RegistryResponseError extends Error {
  constructor(status) {
    super(`npm registry returned HTTP ${status}`);
    this.status = status;
  }
}

async function readOnce(url, request, signal, timeoutMs) {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  let rejectAbort;
  const aborted = new Promise((_, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(controller.signal.reason);
  controller.signal.addEventListener('abort', onAbort, { once: true });
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException(
    `npm registry read exceeded ${timeoutMs}ms`, 'TimeoutError'
  )), timeoutMs);
  try {
    signal?.throwIfAborted();
    return await Promise.race([
      (async () => {
        const response = await request(url, { method: 'GET', signal: controller.signal });
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

/** GET-only boundary: registry outages must never authorize a publication. */
export async function readPublishedMetadata(name, version, {
  request = fetch,
  sleep = (ms, signal) => delay(ms, undefined, { signal }),
  signal,
  timeoutMs = policy.timeoutMs
} = {}) {
  if (!name || !version) throw new Error('Package name and version are required.');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647) {
    throw new RangeError('Registry timeout must be a positive timer-safe integer.');
  }
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
  for (let attempt = 0; attempt < policy.attempts; attempt++) {
    signal?.throwIfAborted();
    try {
      const response = await readOnce(url, request, signal, timeoutMs);
      signal?.throwIfAborted();
      if (response.status === 404) return null;
      if (response.status !== 200) throw new RegistryResponseError(response.status);
      const metadata = JSON.parse(response.text);
      if (metadata?.name !== name || metadata?.version !== version) {
        throw new Error('npm registry returned unexpected package metadata.');
      }
      return metadata;
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      const retryable = error instanceof TypeError || error?.name === 'TimeoutError' ||
        (error instanceof RegistryResponseError && transientStatuses.has(error.status));
      if (!retryable || attempt === policy.attempts - 1) {
        throw new Error(`npm registry lookup failed for ${name}@${version} after ${attempt + 1} attempt(s).`, { cause: error });
      }
      try {
        await sleep(policy.backoffMs * 2 ** attempt, signal);
      } catch (cause) {
        if (signal?.aborted) throw signal.reason;
        throw new Error('npm registry retry delay failed.', { cause });
      }
    }
  }
}

export async function readPublishedVersion(name, version, options = {}) {
  const metadata = await readPublishedMetadata(name, version, options);
  return metadata?.version ?? null;
}

async function main() {
  const controller = new AbortController();
  let exitCode = 1;
  const interrupt = () => { exitCode = 130; controller.abort(new DOMException('Interrupted', 'AbortError')); };
  const terminate = () => { exitCode = 143; controller.abort(new DOMException('Terminated', 'AbortError')); };
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', terminate);
  try {
    const version = await readPublishedVersion(process.argv[2], process.argv[3], { signal: controller.signal });
    if (version !== null) process.stdout.write(`${version}\n`);
  } catch (error) {
    console.error(error);
    process.exitCode = exitCode;
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', terminate);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
