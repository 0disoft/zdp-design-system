import { appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readGitHubJson } from './github-api-read.mjs';

/** API failures must not masquerade as disabled Pages or discard a custom domain. */
export async function resolveGitHubPagesUrl(repository, targetPath, options = {}) {
  options.signal?.throwIfAborted();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '')) throw new Error('Repository owner/name is required.');
  if (targetPath !== '.' && !/^pr-preview\/pr-[1-9][0-9]*$/.test(targetPath ?? '')) {
    throw new Error('Pages target must be main or a pull request preview.');
  }
  const configuredUrl = await readGitHubJson(`/repos/${repository}/pages`, metadata => {
    const value = metadata?.html_url;
    if (typeof value !== 'string' || !/^https?:\/\//.test(value) || /[\r\n]/.test(value) || !URL.canParse(value)) {
      throw new Error('GitHub returned invalid Pages URL metadata.');
    }
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash) throw new Error('GitHub returned invalid Pages URL metadata.');
    return value;
  }, options);
  options.signal?.throwIfAborted();
  const [owner, name] = repository.split('/');
  const base = (configuredUrl ?? `https://${owner}.github.io/${name}`).replace(/\/$/, '') + '/';
  return {
    pages_enabled: String(configuredUrl !== null),
    deployment_url: targetPath === '.' ? base : `${base}${targetPath}/`
  };
}

async function main() {
  const controller = new AbortController();
  let exitCode = 1;
  const interrupt = () => { exitCode = 130; controller.abort(new DOMException('Interrupted', 'AbortError')); };
  const terminate = () => { exitCode = 143; controller.abort(new DOMException('Terminated', 'AbortError')); };
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', terminate);
  try {
    const outputs = await resolveGitHubPagesUrl(process.argv[2], process.argv[3], { signal: controller.signal });
    controller.signal.throwIfAborted();
    const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`).join('');
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, lines, { signal: controller.signal });
    else process.stdout.write(lines);
  } catch (error) {
    console.error(error);
    process.exitCode = exitCode;
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', terminate);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
