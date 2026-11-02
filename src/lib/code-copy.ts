export type ZdpCodeCopyState = 'idle' | 'copying' | 'copied' | 'failed';

interface CodeCopyEnvironment {
  writeText?: (text: string, signal?: AbortSignal) => Promise<void>;
  schedule?: (callback: () => void, delayMs: number) => () => void;
  signal?: AbortSignal;
}

/** Internal copy lifecycle; the Clipboard API itself does not support cancellation. */
export function createZdpCodeCopyController(
  onChange: (state: ZdpCodeCopyState, showProgress: boolean) => void,
  {
    writeText = text => {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        return Promise.reject(new Error('Clipboard API unavailable'));
      }
      return navigator.clipboard.writeText(text);
    },
    schedule = (callback, delayMs) => {
      const timer = setTimeout(callback, delayMs);
      return () => clearTimeout(timer);
    },
    signal
  }: CodeCopyEnvironment = {}
) {
  let state: ZdpCodeCopyState = 'idle';
  let revision = 0;
  let destroyed = false;
  let cancelProgress = () => {};
  let cancelDeadline = () => {};
  let cancelFeedback = () => {};
  let cancelPending: (() => void) | null = null;

  function clearTimers(): void {
    cancelProgress();
    cancelDeadline();
    cancelFeedback();
    cancelProgress = cancelDeadline = cancelFeedback = () => {};
  }

  function reset(): void {
    revision++;
    clearTimers();
    cancelPending?.();
    cancelPending = null;
    state = 'idle';
    onChange(state, false);
  }

  async function copy(text: string): Promise<void> {
    if (destroyed || signal?.aborted || state === 'copying' || text.length === 0) return;
    reset();
    const current = revision;
    state = 'copying';
    onChange(state, false);
    const cancelled = new Promise<'idle'>(resolve => { cancelPending = () => resolve('idle'); });
    const deadline = new Promise<'failed'>(resolve => {
      // A permission prompt or stalled provider must not lock the button forever.
      cancelDeadline = schedule(() => resolve('failed'), 10_000);
    });
    cancelProgress = schedule(() => {
      if (!destroyed && current === revision && !signal?.aborted) onChange('copying', true);
    }, 150);

    let operation: Promise<'copied' | 'failed'>;
    try {
      operation = Promise.resolve(writeText(text, signal)).then(() => 'copied' as const, () => 'failed' as const);
    } catch {
      operation = Promise.resolve('failed');
    }
    const next = await Promise.race([operation, deadline, cancelled]);
    if (destroyed || current !== revision || signal?.aborted) return;
    clearTimers();
    cancelPending = null;
    state = next;
    cancelFeedback = schedule(reset, 2200);
    onChange(state, false);
  }

  signal?.addEventListener('abort', reset, { once: true });
  return {
    copy,
    reset,
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      signal?.removeEventListener('abort', reset);
      reset();
    }
  };
}
