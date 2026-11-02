import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveZdpModalIsolation, type ZdpModalIsolationBranch } from '../src/lib/modal-isolation.js';

const connected = Object.freeze({ hasTopLayer: true, reachedBody: true });
const body = Object.freeze({ name: 'body' });
const container = Object.freeze({ name: 'container' });
const panel = Object.freeze({ name: 'panel' });
const near = Object.freeze({ name: 'near background' });
const outside = Object.freeze({ name: 'outside background' });
type Node = Readonly<{ name: string }>;

function branch(parent: Node, activeBranch: Node, siblings: readonly Node[]): ZdpModalIsolationBranch<Node, Node> {
  return Object.freeze({ parent, activeBranch, siblings: Object.freeze([...siblings]) });
}

test('closed modal has no isolated elements or observed parents', () => {
  const plan = resolveZdpModalIsolation(Object.freeze([]), body, { hasTopLayer: false, reachedBody: false });
  assert.equal(plan.inertElements.size, 0);
  assert.equal(plan.observedParents.size, 0);
});

test('bound layer without a root keeps body observation for later insertion', () => {
  const plan = resolveZdpModalIsolation(Object.freeze([]), body, { hasTopLayer: true, reachedBody: false });
  assert.deepEqual([...plan.observedParents], [body]);
  assert.equal(plan.inertElements.size, 0);
});

test('body itself as active layer does not isolate its own children', () => {
  const plan = resolveZdpModalIsolation(Object.freeze([]), body, connected);
  assert.deepEqual([...plan.observedParents], [body]);
  assert.equal(plan.inertElements.size, 0);
});

test('nested light DOM isolates siblings at every level without isolating the active path', () => {
  const path = Object.freeze([
    branch(container, panel, [near, panel]),
    branch(body, container, [container, outside])
  ]);
  const plan = resolveZdpModalIsolation(path, body, connected);
  assert.deepEqual([...plan.observedParents], [body, container]);
  assert.deepEqual([...plan.inertElements], [near, outside]);
  assert.equal(plan.inertElements.has(panel), false);
  assert.equal(plan.inertElements.has(container), false);
});

test('shadow parent and host remain distinct observation targets', () => {
  const shadow = Object.freeze({ name: 'shadow root' });
  const host = Object.freeze({ name: 'host' });
  const path = Object.freeze([
    branch(shadow, panel, [panel, near]),
    branch(body, host, [host, outside])
  ]);
  const plan = resolveZdpModalIsolation(path, body, connected);
  assert.deepEqual([...plan.observedParents], [body, shadow]);
  assert.deepEqual([...plan.inertElements], [near, outside]);
  assert.equal(plan.inertElements.has(host), false);
});

test('detached path keeps observation but isolates no background until reattached', () => {
  const path = Object.freeze([branch(container, panel, [panel, near])]);
  const detached = resolveZdpModalIsolation(path, body, { hasTopLayer: true, reachedBody: false });
  assert.deepEqual([...detached.observedParents], [body, container]);
  assert.equal(detached.inertElements.size, 0);
  const attached = resolveZdpModalIsolation(path, body, connected);
  assert.deepEqual([...attached.inertElements], [near]);
});

test('sibling identity is deduplicated in encounter order', () => {
  const path = Object.freeze([
    branch(container, panel, [near, panel, near]),
    branch(body, container, [near, container, outside])
  ]);
  const plan = resolveZdpModalIsolation(path, body, connected);
  assert.deepEqual([...plan.inertElements], [near, outside]);
});

test('frozen snapshots are unchanged and output mutations cannot affect another plan', () => {
  const path = Object.freeze([branch(container, panel, [panel, near])]);
  const before = JSON.stringify(path);
  const first = resolveZdpModalIsolation(path, body, connected);
  first.inertElements.clear();
  first.observedParents.clear();
  const second = resolveZdpModalIsolation(path, body, connected);
  assert.deepEqual([...second.inertElements], [near]);
  assert.deepEqual([...second.observedParents], [body, container]);
  assert.equal(JSON.stringify(path), before);
  assert.equal(connected.reachedBody, true);
});
