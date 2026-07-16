import { hydrate, tick } from 'svelte';
import StatusToastHydration from './StatusToastHydration.svelte';

const target = document.querySelector('#app');

if (!(target instanceof HTMLElement)) {
  throw new Error('SSR hydration fixture root was not found.');
}

try {
  hydrate(StatusToastHydration, { target });
  await tick();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  window.__zdpHydrationResult = window.__zdpCaptureHydrationContract(target);
} catch (error) {
  window.__zdpHydrationError = error instanceof Error ? error.message : String(error);
}
