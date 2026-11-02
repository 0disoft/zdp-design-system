import assert from 'node:assert/strict';

export async function verifyRadioFocusIndex(page, moduleUrl) {
  const result = await page.evaluate(async (url) => {
    const { createZdpFocusableCache, isZdpFocusableElement } = await import(url);
    const root = document.createElement('section');
    document.body.append(root);
    const previousFocus = document.activeElement;
    const cache = createZdpFocusableCache(() => root);
    const candidates = [];
    let scenarios = 0;
    function add(tag, id, props = {}, parent = root) {
      const element = document.createElement(tag);
      Object.assign(element, { id }, props);
      parent.append(element);
      if (tag === 'button' || tag === 'input') candidates.push(element);
      return element;
    }
    const radio = (id, name, props = {}, parent = root) => add('input', id, { type: 'radio', name, ...props }, parent);
    const ids = elements => elements.map(element => element.id);
    function expectIds(actual, expected, label) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
      }
    }
    // Previous algorithm is the compatibility oracle, including first checked
    // member, form/root identity and DOM order before positive-tabindex sorting.
    function previousOrder() {
      const eligible = candidates.filter(isZdpFocusableElement);
      return eligible.filter(element => {
        if (element.tagName !== 'INPUT' || element.type !== 'radio' || element.name === '') return true;
        const group = eligible.filter(candidate => candidate.tagName === 'INPUT' && candidate.type === 'radio' &&
          candidate.name === element.name && candidate.form === element.form && candidate.getRootNode() === element.getRootNode());
        return (group.find(candidate => candidate.checked) ?? group[0]) === element;
      }).map((element, order) => ({ element, order })).sort((a, b) => {
        const left = Math.max(0, a.element.tabIndex);
        const right = Math.max(0, b.element.tabIndex);
        return (left > 0 ? left : Infinity) - (right > 0 ? right : Infinity) || a.order - b.order;
      }).map(({ element }) => element);
    }
    function check(label) {
      const actual = cache.get();
      expectIds(ids(actual), ids(previousOrder()), label);
      scenarios++;
      return ids(actual);
    }
    try {
      add('button', 'ordinary');
      add('button', 'positive-two', { tabIndex: 2 });
      add('button', 'positive-one', { tabIndex: 1 });
      add('button', 'positive-one-tie', { tabIndex: 1 });
      const first = radio('first', 'choice');
      const selected = radio('selected', 'choice', { checked: true });
      radio('unchecked-first', 'unchecked', { tabIndex: 5 });
      radio('unchecked-later', 'unchecked', { tabIndex: 1 });
      radio('unnamed-one', '');
      radio('unnamed-two', '');
      radio('hidden-checked', 'visibility', { checked: true, hidden: true });
      radio('visible', 'visibility');
      radio('disabled-checked', 'disabled-group', { checked: true, disabled: true });
      radio('enabled', 'disabled-group');
      expectIds(check('initial order'), ['positive-one', 'positive-one-tie', 'positive-two', 'unchecked-first',
        'ordinary', 'selected', 'unnamed-one', 'unnamed-two', 'visible', 'enabled'], 'explicit focus order');

      first.checked = true;
      const updated = check('silent checked property update');
      if (!updated.includes('first') || updated.includes('selected')) throw new Error('Silent selection was stale.');
      first.checked = false;
      check('unchecked group uses first candidate');

      const formA = add('form', 'form-a');
      const formB = add('form', 'form-b');
      radio('form-a-first', 'choice', {}, formA);
      radio('form-b-first', 'choice', {}, formB);
      const owners = check('same name in different forms');
      if (!owners.includes('form-a-first') || !owners.includes('form-b-first')) throw new Error('Forms were merged.');
      selected.setAttribute('form', 'form-a');
      selected.checked = true;
      check('form reassociation without discarding cached layout');

      for (const name of ['__proto__', 'constructor', 'a:b']) radio(`special-${name}`, name);
      for (let i = 0; i < 2; i++) {
        const shadow = add('div', `host-${i}`).attachShadow({ mode: 'open' });
        radio(`shadow-first-${i}`, 'choice', {}, shadow);
        radio(`shadow-checked-${i}`, 'choice', { checked: true }, shadow);
      }
      const scoped = check('special names and separate shadow roots');
      if (!scoped.includes('shadow-checked-0') || !scoped.includes('shadow-checked-1')) throw new Error('Shadow scopes were merged.');
      first.name = 'renamed';
      check('radio renamed between lookups');
      first.remove();
      candidates.splice(candidates.indexOf(first), 1);
      check('radio removed between lookups');

      root.replaceChildren();
      const size = 2000;
      let reads = 0;
      const nameGetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'name').get;
      for (let i = 0; i < size; i++) {
        const element = radio(`bulk-${i}`, `bulk-group-${i % 100}`);
        Object.defineProperty(element, 'name', { get() { reads++; return nameGetter.call(this); } });
      }
      cache.get(); // Warm the visibility cache; group membership must still be refreshed.
      reads = 0;
      const start = performance.now();
      const bulk = cache.get();
      const elapsedMs = performance.now() - start;
      if (bulk.length !== 100) throw new Error('Large groups produced the wrong number of tab stops.');
      return { scenarios, size, reads, elapsedMs };
    } finally {
      cache.destroy();
      root.remove();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    }
  }, moduleUrl);
  console.log(`Radio focus: ${result.scenarios} compatibility scenarios; ${result.size} candidates, ${result.reads} name reads, ${result.elapsedMs.toFixed(1)}ms warm lookup.`);
  assert.ok(result.reads <= result.size * 5, 'Radio group lookup must scale linearly with candidate count.');
}
