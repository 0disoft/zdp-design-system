import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkLoadingMotion } from './loading-motion-contract';
import { assertNoDecorativeEffects } from './style-contract';

const fixture = `
  @media (prefers-reduced-motion: reduce) {
    .zdp-button[data-loading='true'] .zdp-button__spinner { animation: none; }
  }
  .zdp-button[data-loading="true"] .zdp-button__spinner {
    /* Timing and animation names are owned by component CSS. */
    animation: renamed-loading 2s linear infinite;
  }
  @keyframes renamed-loading { to { transform: rotate(1turn); } }
`;

test('loading policy tolerates quote, whitespace, declaration order and timing changes', () => {
  assert.deepEqual(checkLoadingMotion(fixture), []);
  const failures: string[] = [];
  assertNoDecorativeEffects(failures, 'CSS', fixture, 'stylesheet');
  assertNoDecorativeEffects(failures, 'Svelte', `<style>${fixture}</style>`, 'component');
  assert.deepEqual(failures, []);
});

test('ordinary decorative motion remains forbidden', () => {
  const failures: string[] = [];
  assertNoDecorativeEffects(failures, 'CSS', fixture);
  assert.ok(failures.length > 0);
  assert.ok(checkLoadingMotion(fixture.replaceAll('.zdp-button__spinner', '.zdp-card')).length > 0);
});

test('loading motion must respect reduced-motion preferences', () => {
  assert.ok(checkLoadingMotion(fixture.replace('animation: none;', 'animation: renamed-loading 2s linear infinite;'))
    .includes('Loading selector .zdp-button[data-loading="true"] .zdp-button__spinner needs a reduced-motion override.'));
});

test('keyframes must be defined and used by a functional indicator', () => {
  assert.ok(checkLoadingMotion(fixture.replace('@keyframes renamed-loading', '@keyframes unused'))
    .includes('Loading animation renamed-loading has no keyframes.'));
  assert.ok(checkLoadingMotion('@keyframes unused {to {opacity: 1;}}')
    .includes('Keyframes unused must belong to a loading indicator.'));
});

test('animation longhands cannot bypass loading scope checks', () => {
  assert.ok(checkLoadingMotion('.zdp-card { animation-name: decorative; }').length > 0);
});

test('loading keyframes cannot animate layout or unrelated decoration', () => {
  assert.ok(checkLoadingMotion(fixture.replace('transform: rotate(1turn)', 'width: 200px')).length > 0);
  assert.ok(checkLoadingMotion(fixture.replace('transform: rotate(1turn)', 'transform: scale(2)')).length > 0);
});
