import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import type { SourceReader } from './types';

export function createWorkingTreeReader(repoRoot = process.cwd()): SourceReader {
  const root = resolve(repoRoot);
  return {
    label: 'working tree',
    async readText(path: string): Promise<string> {
      return readFile(resolveRepoPath(root, path), 'utf8');
    }
  };
}

export function createGitRefReader(ref: string, repoRoot = process.cwd()): SourceReader {
  const root = resolve(repoRoot);
  const normalizedRef = assertGitCommitRef(ref);

  return {
    label: `git ref ${normalizedRef}`,
    async readText(path: string): Promise<string> {
      assertRepoPath(path);
      const result = spawnSync('git', ['show', `${normalizedRef}:${path}`], {
        cwd: root,
        encoding: 'utf8',
        shell: false
      });
      if (result.error) {
        throw new Error(`Could not read ${path} from ${normalizedRef}: ${result.error.message}`);
      }
      if (result.status !== 0) {
        const detail = (result.stderr || result.stdout || 'unknown git show failure').trim();
        throw new Error(`Could not read ${path} from ${normalizedRef}: ${detail}`);
      }
      return result.stdout;
    }
  };
}

export function assertGitCommitRef(ref: string): string {
  const normalized = ref.trim();
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/i.test(normalized)) {
    throw new Error('Git base ref must be a full 40- or 64-character commit SHA.');
  }
  return normalized;
}

function resolveRepoPath(root: string, path: string): string {
  assertRepoPath(path);
  const resolved = resolve(root, path);
  const fromRoot = relative(root, resolved);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    throw new Error(`Refusing to read outside repository: ${path}`);
  }
  return resolved;
}

function assertRepoPath(path: string): void {
  if (
    !path ||
    isAbsolute(path) ||
    path.includes('\0') ||
    path.includes('\\') ||
    path.split('/').some((segment) => segment === '..')
  ) {
    throw new Error(`Invalid repository-relative path: ${path}`);
  }
}
