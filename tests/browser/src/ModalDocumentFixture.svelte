<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    createZdpModalLayer,
    type ZdpModalLayerHandle
  } from '../../../src/lib/modal-layer';

  let primaryRoot: HTMLElement;
  let secondaryFrame: HTMLIFrameElement;
  let primaryHandle: ZdpModalLayerHandle | null = null;
  let secondaryHandle: ZdpModalLayerHandle | null = null;

  onMount(() => {
    const secondaryDocument = secondaryFrame.contentDocument;

    if (secondaryDocument === null) {
      return;
    }

    const secondaryRoot = secondaryDocument.createElement('section');
    const activateButton = secondaryDocument.createElement('button');
    const closeButton = secondaryDocument.createElement('button');
    secondaryRoot.dataset.testid = 'secondary-document-modal-root';
    activateButton.type = 'button';
    activateButton.textContent = 'Activate secondary document modal';
    closeButton.type = 'button';
    closeButton.textContent = 'Close secondary document modal';
    activateButton.addEventListener('click', () => {
      secondaryHandle ??= createZdpModalLayer();
      secondaryHandle.setActive(true, secondaryRoot);
    });
    closeButton.addEventListener('click', closeSecondaryLayer);
    secondaryRoot.append(activateButton, closeButton);
    secondaryDocument.body.replaceChildren(secondaryRoot);
  });

  onDestroy(() => {
    closeSecondaryLayer();
    closePrimaryLayer();
  });

  function activatePrimaryLayer(): void {
    primaryHandle ??= createZdpModalLayer();
    primaryHandle.setActive(true, primaryRoot);
  }

  function closePrimaryLayer(): void {
    primaryHandle?.setActive(false, primaryRoot);
    primaryHandle?.destroy();
    primaryHandle = null;
  }

  function closeSecondaryLayer(): void {
    secondaryHandle?.setActive(false);
    secondaryHandle?.destroy();
    secondaryHandle = null;
  }
</script>

<section bind:this={primaryRoot} data-testid="primary-document-modal-root">
  <button type="button" onclick={activatePrimaryLayer}>Activate primary document modal</button>
  <button type="button" onclick={closePrimaryLayer}>Close primary document modal</button>
  <iframe bind:this={secondaryFrame} title="Secondary modal document"></iframe>
</section>
