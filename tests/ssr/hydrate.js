import { hydrate, tick } from 'svelte';
import IdHydrationFixture from './IdHydrationFixture.svelte';

const target = document.querySelector('#app');

if (!(target instanceof HTMLElement)) {
  throw new Error('SSR hydration fixture root was not found.');
}

try {
  hydrate(IdHydrationFixture, { target });
  await tick();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  window.__zdpHydrationResult = window.__zdpCaptureHydrationContract(target);
} catch (error) {
  window.__zdpHydrationError = error instanceof Error ? error.message : String(error);
}
