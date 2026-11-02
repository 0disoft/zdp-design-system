import assert from 'node:assert/strict';

export async function verifyFormResetBatching(page) {
  const results = await page.evaluate(async (rootPath) => {
    const { syncZdpFormReset } = await import(`/@fs/${rootPath}/src/lib/form-reset.ts`);
    const results = [];
    for (const mode of ['large', 'cancelled', 'destroyed', 'partial-destroy', 'destroy-during-callback', 'throwing', 'two-forms', 'repeated']) {
      const container = document.createElement('div');
      const forms = [document.createElement('form'), document.createElement('form')];
      container.append(...forms);
      document.body.append(container);
      const calls = [];
      const errors = [];
      const failure = new Error('reset callback failed');
      const handleError = event => { errors.push(event.error); event.preventDefault(); };
      window.addEventListener('error', handleError);
      const actions = [];
      const inputs = [];
      const count = mode === 'large' ? 1000 : 3;
      for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        (mode === 'two-forms' && i === 2 ? forms[1] : forms[0]).append(input);
        inputs.push(input);
        actions.push(syncZdpFormReset(input, {
          initialValue: `seed-${i}`,
          onReset: control => {
            if (mode === 'throwing' && i === 0) throw failure;
            if (mode === 'destroy-during-callback' && i === 0) actions[1].destroy();
            calls.push([i, control.value]);
          }
        }));
      }
      await Promise.resolve();
      for (const input of inputs) input.value = 'edited';
      if (mode === 'cancelled') forms[0].addEventListener('reset', event => event.preventDefault());
      const originalSet = window.setTimeout;
      const originalClear = window.clearTimeout;
      const scheduled = new Set();
      const cleared = new Set();
      window.setTimeout = (...args) => {
        const timer = originalSet(...args);
        scheduled.add(timer);
        return timer;
      };
      window.clearTimeout = timer => { cleared.add(timer); originalClear(timer); };
      try {
        forms[0].reset();
        if (mode === 'two-forms') forms[1].reset();
        if (mode === 'repeated') forms[0].reset();
        if (mode === 'destroyed') for (const action of actions) action.destroy();
        if (mode === 'partial-destroy') actions[0].destroy();
        // Restore timer instrumentation before waiting for the native callbacks.
        window.setTimeout = originalSet;
        window.clearTimeout = originalClear;
        await new Promise(resolve => originalSet(resolve, 20));
        results.push({ mode, timers: scheduled.size, cleared: cleared.size, calls,
          originalError: errors.length === 1 && errors[0] === failure,
          values: inputs.map(input => input.value) });
      } finally {
        window.setTimeout = originalSet;
        window.clearTimeout = originalClear;
        for (const action of actions) action.destroy();
        window.removeEventListener('error', handleError);
        container.remove();
      }
    }
    return results;
  }, process.cwd().replaceAll('\\', '/'));
  for (const result of results) {
    const { mode, timers, cleared, calls, originalError, values } = result;
    assert.equal(timers, mode === 'two-forms' || mode === 'repeated' ? 2 : 1,
      `${mode}: schedule one deferred task per reset event, regardless of input count.`);
    assert.equal(cleared, mode === 'destroyed' ? 1 : 0);
    const count = mode === 'large' ? 1000 : 3;
    const expectedCalls = Array.from({ length: count }, (_, i) => [i, `seed-${i}`]);
    assert.deepEqual(calls, mode === 'cancelled' || mode === 'destroyed' ? [] :
      mode === 'throwing' || mode === 'partial-destroy' ? expectedCalls.slice(1) :
      mode === 'destroy-during-callback' ? [expectedCalls[0], expectedCalls[2]] :
      mode === 'repeated' ? [...expectedCalls, ...expectedCalls] : expectedCalls,
    `${mode}: preserve callback order and isolate a throwing control.`);
    assert.equal(originalError, mode === 'throwing');
    assert.deepEqual(values, Array.from({ length: count }, (_, i) =>
      mode === 'cancelled' ? 'edited' : `seed-${i}`));
  }
  console.log(`Form reset batching: ${results.length} scenarios passed (1000 inputs, 1 timer).`);
}
