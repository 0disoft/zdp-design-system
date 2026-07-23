export type ZdpSplitPaneOrientation = 'vertical' | 'horizontal';

export interface ZdpSplitPaneSizeBounds {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

export interface ZdpSplitPaneSizePersistenceOptions extends ZdpSplitPaneSizeBounds {
  key: string;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
}

export interface ZdpSplitPaneSizePersistence {
  readonly key: string;
  load(): number;
  save(size: number): boolean;
  clear(): boolean;
}

const ZDP_SPLIT_PANE_STORAGE_PREFIX = 'zdp:split-pane-size:v1:';

export function clampZdpSplitPaneSize(size: number, bounds: ZdpSplitPaneSizeBounds = {}): number {
  const { defaultSize, minSize, maxSize } = normalizeBounds(bounds);
  const candidate = Number.isFinite(size) ? Math.round(size) : defaultSize;
  return Math.min(maxSize, Math.max(minSize, candidate));
}

export function createZdpSplitPaneSizePersistence(
  options: ZdpSplitPaneSizePersistenceOptions
): ZdpSplitPaneSizePersistence {
  const storageKey = createStorageKey(options.key);
  const bounds = normalizeBounds(options);

  function resolveStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null {
    if (options.storage !== undefined) {
      return options.storage;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  return {
    key: storageKey,
    load(): number {
      const storage = resolveStorage();

      if (!storage) {
        return bounds.defaultSize;
      }

      try {
        const storedValue = storage.getItem(storageKey);
        const parsedValue = storedValue === null || storedValue.trim() === '' ? Number.NaN : Number(storedValue);
        return Number.isFinite(parsedValue)
          ? clampZdpSplitPaneSize(parsedValue, bounds)
          : bounds.defaultSize;
      } catch {
        return bounds.defaultSize;
      }
    },
    save(size: number): boolean {
      const storage = resolveStorage();

      if (!storage) {
        return false;
      }

      try {
        storage.setItem(storageKey, String(clampZdpSplitPaneSize(size, bounds)));
        return true;
      } catch {
        return false;
      }
    },
    clear(): boolean {
      const storage = resolveStorage();

      if (!storage) {
        return false;
      }

      try {
        storage.removeItem(storageKey);
        return true;
      } catch {
        return false;
      }
    }
  };
}

function normalizeBounds(bounds: ZdpSplitPaneSizeBounds): Required<ZdpSplitPaneSizeBounds> {
  const minSize = normalizeNonNegativeSize(bounds.minSize, 220);
  const maxSize = Math.max(minSize, normalizeNonNegativeSize(bounds.maxSize, 480));
  const defaultSize = Math.min(
    maxSize,
    Math.max(minSize, normalizeNonNegativeSize(bounds.defaultSize, 280))
  );

  return { defaultSize, minSize, maxSize };
}

function normalizeNonNegativeSize(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value as number)) : fallback;
}

function createStorageKey(key: string): string {
  const normalizedKey = key.trim();

  if (normalizedKey.length === 0) {
    throw new TypeError('Split pane persistence requires a non-empty key.');
  }

  return `${ZDP_SPLIT_PANE_STORAGE_PREFIX}${normalizedKey}`;
}
