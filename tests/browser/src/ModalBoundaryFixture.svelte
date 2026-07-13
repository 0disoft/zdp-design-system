<script lang="ts">
  import { mount, onDestroy, onMount, unmount } from 'svelte';
  import PortalDialogSurface from './PortalDialogSurface.svelte';
  import ShadowDialogSurface from './ShadowDialogSurface.svelte';

  let shadowHost: HTMLDivElement;
  let portalHost: HTMLDivElement | null = null;
  let portalSurface: Record<string, unknown> | null = null;

  onMount(() => {
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const shadowSurface = mount(ShadowDialogSurface, { target: shadowRoot });

    return () => {
      void unmount(shadowSurface);
    };
  });

  onDestroy(() => {
    closePortalDialog();
  });

  function openPortalDialog(): void {
    if (portalSurface !== null) {
      return;
    }

    portalHost = document.createElement('div');
    portalHost.dataset.testid = 'portal-dialog-host';
    document.body.append(portalHost);
    portalSurface = mount(PortalDialogSurface, {
      target: portalHost,
      props: { onClose: closePortalDialog }
    });
  }

  function closePortalDialog(): void {
    const surface = portalSurface;
    const host = portalHost;
    portalSurface = null;
    portalHost = null;

    if (surface !== null) {
      void unmount(surface);
    }

    host?.remove();
  }
</script>

<div data-testid="shadow-modal-host" bind:this={shadowHost}></div>
<button data-testid="shadow-overlay-outside-target" type="button">Outside embedded overlays</button>
<button data-testid="portal-dialog-trigger" type="button" onclick={openPortalDialog}>
  Open portal dialog
</button>
