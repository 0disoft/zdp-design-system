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

  const ownershipReads = await page.evaluate(async (rootPath) => {
    const { syncZdpFormReset } = await import(`/@fs/${rootPath}/src/lib/form-reset.ts`);
    const form = document.createElement('form');
    const otherForm = document.createElement('form');
    otherForm.id = 'form-ownership-other';
    const results = document.createElement('div');
    document.body.append(form, otherForm, results);

    const inputs = Array.from({ length: 1000 }, () => document.createElement('input'));
    form.append(...inputs.slice(0, 3));
    otherForm.append(...inputs.slice(3));
    for (const input of inputs.slice(3)) input.setAttribute('form', otherForm.id);
    const actions = inputs.map(input => syncZdpFormReset(input, { onReset() {} }));
    try {
      await Promise.resolve();
      let reads = 0;
      for (const input of inputs) {
        const getRootNode = input.getRootNode.bind(input);
        input.getRootNode = () => {
          reads++;
          return getRootNode();
        };
      }
      const row = document.createElement('div');
      row.append(document.createElement('span'));
      results.append(row);
      await Promise.resolve();
      const unrelated = reads;

      row.id = 'unrelated-form-results';
      await Promise.resolve();
      const afterId = reads - unrelated;

      const moved = document.createElement('div');
      moved.append(inputs[0]);
      results.append(moved);
      await Promise.resolve();
      const afterMove = reads - unrelated - afterId;

      // A control can switch from its ancestor form to an explicit association.
      form.id = 'form-ownership-probe';
      inputs[1].setAttribute('form', form.id);
      inputs[2].setAttribute('form', 'form-ownership-renamed');
      await Promise.resolve();
      const beforeBlocker = reads;
      const blocker = document.createElement('div');
      blocker.id = form.id;
      form.before(blocker);
      await Promise.resolve();
      const afterBlocker = reads - beforeBlocker;
      blocker.remove();
      await Promise.resolve();
      const afterUnblock = reads - beforeBlocker - afterBlocker;
      const beforeRename = reads;
      inputs[1].name = 'id';
      form.setAttribute('id', 'form-ownership-renamed');
      await Promise.resolve();
      const afterRename = reads - beforeRename;
      const renamedOwners = [inputs[1].form === null, inputs[2].form === form];
      return { unrelated, afterId, afterMove, afterBlocker, afterUnblock, afterRename, renamedOwners };
    } finally {
      for (const action of actions) action.destroy();
      form.remove();
      otherForm.remove();
      results.remove();
    }
  }, process.cwd().replaceAll('\\', '/'));
  assert.deepEqual(ownershipReads, {
    unrelated: 0, afterId: 0, afterMove: 1, afterBlocker: 1, afterUnblock: 1, afterRename: 2,
    renamedOwners: [true, true]
  }, 'Refresh only moved controls and references affected by ID collisions or renames.');
  console.log('Form ownership: 0 reads for an unrelated ID, 1 for a collision, 2 for a rename with 1000 mounted inputs.');

  const targetedReset = await page.evaluate(async (rootPath) => {
    const { syncZdpFormReset } = await import(`/@fs/${rootPath}/src/lib/form-reset.ts`);
    const container = document.createElement('div');
    const target = document.createElement('form');
    const other = document.createElement('form');
    const input = document.createElement('input');
    target.append(input);
    container.append(target, other);
    document.body.append(container);
    let unrelatedReads = 0;
    let unrelatedCallbacks = 0;
    const restored = [];
    const active = syncZdpFormReset(input, { initialValue: 'seed', onReset: control => restored.push(control.value) });
    const inputs = Array.from({ length: 1000 }, () => document.createElement('input'));
    other.append(...inputs);
    const actions = inputs.map(control => syncZdpFormReset(control, { onReset: () => unrelatedCallbacks++ }));
    const getForm = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'form').get;
    try {
      await Promise.resolve();
      for (const control of inputs) {
        Object.defineProperty(control, 'form', { get() { unrelatedReads++; return getForm.call(this); } });
      }
      input.value = 'edited';
      target.reset();
      const readsDuringReset = unrelatedReads;
      await new Promise(resolve => setTimeout(resolve, 20));
      return { readsDuringReset, unrelatedCallbacks, restored };
    } finally {
      active.destroy();
      for (const action of actions) action.destroy();
      container.remove();
    }
  }, process.cwd().replaceAll('\\', '/'));
  assert.deepEqual(targetedReset, { readsDuringReset: 0, unrelatedCallbacks: 0, restored: ['seed'] },
    'Reset dispatch must touch only the target form.');
  console.log('Form reset dispatch: 0 reads for 1000 controls in an unrelated form.');
}
