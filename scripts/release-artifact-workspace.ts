import { mkdir, mkdtemp, open, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const releaseArtifactLockName = '.zdp-release-artifact.lock';

interface ReleaseArtifactWorkspaceIO {
  openLock(path: string): Promise<{
    writeFile(content: string): Promise<void>;
    close(): Promise<void>;
  }>;
  createStaging(path: string): Promise<void>;
}

/** One output writer across processes; every allocated resource has a finally. */
export async function withReleaseArtifactWorkspace<T>(
  artifactDirectory: string,
  operation: (stagingDirectory: string) => Promise<T>,
  {
    openLock = path => open(path, 'wx'),
    createStaging = async path => { await mkdir(path); }
  }: Partial<ReleaseArtifactWorkspaceIO> = {}
): Promise<T> {
  const output = resolve(artifactDirectory);
  await mkdir(output, { recursive: true });
  const lockPath = join(output, releaseArtifactLockName);
  const lock = await openLock(lockPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'EEXIST') {
      throw new Error(`Release artifact output already locked: ${lockPath}. Retry after the active build finishes. Remove a stale lock only after confirming no build is running.`);
    }
    throw error;
  });
  try {
    await lock.writeFile(`${process.pid}\n`);
    const temporaryRoot = await mkdtemp(join(tmpdir(), 'zdp-release-artifact-'));
    try {
      const stagingDirectory = join(temporaryRoot, 'package');
      await createStaging(stagingDirectory);
      return await operation(stagingDirectory);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  } finally {
    try {
      await lock.close();
    } finally {
      await rm(lockPath, { force: true });
    }
  }
}
