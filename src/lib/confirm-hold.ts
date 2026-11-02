const holdPolicy = Object.freeze({ minimumMs: 600, defaultMs: 2000, maximumMs: 2_147_483_647 });

interface HoldEnvironment {
  now?: () => number;
  schedule?: (callback: () => void, delayMs: number) => () => void;
  signal?: AbortSignal;
}

export function normalizeConfirmHoldDuration(durationMs: number): number {
  return Math.min(holdPolicy.maximumMs, Math.max(holdPolicy.minimumMs,
    Number.isFinite(durationMs) ? durationMs : holdPolicy.defaultMs));
}

/** Internal hold deadline; a timer wake-up alone never authorizes confirmation. */
export function scheduleConfirmHold(
  durationMs: number,
  onConfirm: () => void,
  {
    now = () => performance.now(),
    schedule = (callback, delayMs) => {
      const timer = setTimeout(callback, delayMs);
      return () => clearTimeout(timer);
    },
    signal
  }: HoldEnvironment = {}
): () => void {
  let active = true;
  let cancelTimer = () => {};
  function cancel(): void {
    if (!active) return;
    active = false;
    cancelTimer();
    signal?.removeEventListener('abort', cancel);
  }
  if (signal?.aborted) { cancel(); return cancel; }
  const duration = normalizeConfirmHoldDuration(durationMs);
  const startedAt = now();
  if (!Number.isFinite(startedAt)) throw new RangeError('Confirmation clock must be finite.');

  function wake(): void {
    if (!active) return;
    try {
      const elapsed = now() - startedAt;
      if (!Number.isFinite(elapsed) || elapsed < 0) {
        throw new RangeError('Confirmation clock must remain finite and monotonic.');
      }
      if (elapsed < duration) {
        // Round up: DOM timers truncate fractional delays and can otherwise
        // complete just before the requested deadline.
        cancelTimer = schedule(wake, Math.ceil(duration - elapsed));
        return;
      }
    } catch (error) {
      cancel();
      throw error;
    }
    cancel();
    onConfirm();
  }
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) { cancel(); return cancel; }
  try {
    cancelTimer = schedule(wake, Math.ceil(duration));
  } catch (error) {
    cancel();
    throw error;
  }
  return cancel;
}
