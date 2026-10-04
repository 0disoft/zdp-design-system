/* llmnav/1 module
id=zdp.design.package.recovery
role=Recover interrupted package replacement and restore the previous directory when promotion fails.
owns=directory replacement|failed promotion recovery
excludes=package assembly|npm publication
search=rollback|롤백|이전 패키지 복원
invariant=A failed promotion restores the previous target when its backup exists.
stability=architecture
*/

import { existsSync } from 'node:fs';
import { open, rename, rm } from 'node:fs/promises';

export interface AtomicDirectoryPaths {
  backupRoot: string;
  stagingRoot: string;
  targetRoot: string;
}

interface AtomicDirectoryReplaceOptions extends AtomicDirectoryPaths {
  beforePromote?: (() => Promise<void>) | undefined;
}

export interface AtomicDirectoryTransaction {
  recover(): Promise<void>;
  replace(beforePromote?: () => Promise<void>): Promise<void>;
}

/** Hold ownership from recovery through staging, promotion, and failure cleanup. */
export async function withAtomicDirectory<T>(
  paths: AtomicDirectoryPaths,
  operation: (transaction: AtomicDirectoryTransaction) => Promise<T>
): Promise<T> {
  const lockPath = `${paths.targetRoot}.__lock__`;
  const lock = await open(lockPath, 'wx').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'EEXIST') {
      throw new Error(`Package build already locked: ${lockPath}. Retry after the active build finishes. If a crashed build left this file, remove it only after confirming no build is running.`);
    }
    throw error;
  });
  let active = true;
  function assertActive(): void {
    if (!active) throw new Error('Atomic directory transaction is already closed.');
  }
  try {
    await lock.writeFile(`${process.pid}\n`);
    return await operation({
      recover: async () => {
        assertActive();
        await recoverAtomicDirectory(paths);
      },
      replace: async (beforePromote) => {
        assertActive();
        await replaceDirectoryAtomically({ ...paths, beforePromote });
      }
    });
  } finally {
    active = false;
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

async function recoverAtomicDirectory(paths: AtomicDirectoryPaths): Promise<void> {
  const { backupRoot, stagingRoot, targetRoot } = paths;

  if (!existsSync(targetRoot) && existsSync(backupRoot)) {
    await rename(backupRoot, targetRoot);
  } else if (existsSync(targetRoot) && existsSync(backupRoot)) {
    await rm(backupRoot, { force: true, recursive: true });
  }

  await rm(stagingRoot, { force: true, recursive: true });
}

async function replaceDirectoryAtomically(options: AtomicDirectoryReplaceOptions): Promise<void> {
  const { backupRoot, beforePromote, stagingRoot, targetRoot } = options;

  if (!existsSync(stagingRoot)) {
    throw new Error(`Atomic directory replacement requires a completed staging directory: ${stagingRoot}`);
  }

  await rm(backupRoot, { force: true, recursive: true });
  const hadTarget = existsSync(targetRoot);

  try {
    if (hadTarget) {
      await rename(targetRoot, backupRoot);
    }

    await beforePromote?.();
    await rename(stagingRoot, targetRoot);
  } catch (error) {
    if (!existsSync(targetRoot) && hadTarget && existsSync(backupRoot)) {
      await rename(backupRoot, targetRoot);
    }
    throw error;
  }

  await rm(backupRoot, { force: true, recursive: true });
}
