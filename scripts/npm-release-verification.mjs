import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { readPublishedMetadata } from './npm-release-preflight.mjs';

const visibilityPolicy = Object.freeze({ attempts: 12, backoffMs: 1000, maxBackoffMs: 30_000 });

/** Read-only verification; a failed check must never repeat npm publish. */
export async function verifyPublishedArtifact(expected, {
  request = fetch,
  sleep = (ms, signal) => delay(ms, undefined, { signal }),
  signal,
  timeoutMs = 5000
} = {}) {
  for (const field of ['package', 'version', 'gitHead', 'integrity']) {
    if (typeof expected?.[field] !== 'string' || !expected[field].trim()) {
      throw new Error(`Release artifact ${field} is required.`);
    }
  }
  try {
    for (let attempt = 0; attempt < visibilityPolicy.attempts; attempt++) {
      signal?.throwIfAborted();
      const metadata = await readPublishedMetadata(expected.package, expected.version, {
        request, sleep, signal, timeoutMs
      });
      if (metadata !== null) {
        if (metadata.gitHead !== expected.gitHead || metadata.dist?.integrity !== expected.integrity) {
          throw new Error('Published npm metadata does not match the verified release artifact.');
        }
        const tarball = metadata.dist?.tarball;
        if (typeof tarball !== 'string' || !tarball.startsWith('https://') || !URL.canParse(tarball)) {
          throw new Error('Published npm metadata contains an invalid tarball URL.');
        }
        return tarball;
      }
      if (attempt === visibilityPolicy.attempts - 1) {
        throw new Error(`npm still returned HTTP 404 after ${visibilityPolicy.attempts} visibility checks.`);
      }
      // Only a definite 404 is publication visibility lag. Other failures retain
      // the read helper's bounded transient retry policy (three 5s attempts).
      // At defaults, all visibility checks and backoffs total at most 400s of waits.
      await sleep(Math.min(visibilityPolicy.backoffMs * 2 ** attempt, visibilityPolicy.maxBackoffMs), signal);
    }
  } catch (cause) {
    if (signal?.aborted) throw signal.reason;
    throw new Error(`npm publication verification failed for ${expected.package}@${expected.version}.`, { cause });
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
    const expected = JSON.parse(await readFile(process.argv[2], { encoding: 'utf8', signal: controller.signal }));
    const tarball = await verifyPublishedArtifact(expected, { signal: controller.signal });
    process.stdout.write(`${tarball}\n`);
  } catch (error) {
    console.error(error);
    process.exitCode = exitCode;
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', terminate);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
