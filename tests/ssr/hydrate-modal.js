import { hydrate, tick } from 'svelte';
import ModalHydrationFixture from './ModalHydrationFixture.svelte';

const target = document.querySelector('#app');
const kind = window.__zdpModalHydrationKind;

if (!(target instanceof HTMLElement)) {
  throw new Error('Modal SSR hydration fixture root was not found.');
}

if (kind !== 'dialog' && kind !== 'sheet' && kind !== 'term-sheet') {
  throw new Error(`Unknown modal SSR hydration fixture kind: ${String(kind)}`);
}

try {
  hydrate(ModalHydrationFixture, { props: { kind }, target });
  await tick();
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const background = target.querySelector('[data-testid="modal-hydration-background"]');
  const layer = target.querySelector('[data-zdp-modal-layer-root]');
  window.__zdpModalHydrationResult = {
    backgroundInert: background?.hasAttribute('inert') ?? false,
    bodyOverflow: document.body.style.overflow,
    layerActive: layer?.getAttribute('data-zdp-modal-layer-active') ?? null,
    layerCount: document.documentElement.getAttribute('data-zdp-modal-layer-count'),
    layerLevel: layer?.getAttribute('data-zdp-modal-layer-level') ?? null
  };
} catch (error) {
  window.__zdpModalHydrationError = error instanceof Error ? error.message : String(error);
}
