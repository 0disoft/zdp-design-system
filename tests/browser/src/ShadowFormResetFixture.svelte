<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import styles from '../../../src/styles/index.css?inline';
  import FormResetFixture from './FormResetFixture.svelte';
  let frame: HTMLIFrameElement;

  onMount(() => {
    const document = frame.contentDocument;
    if (!document) return;
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.append(style);
    const host = document.createElement('div');
    host.dataset.testid = 'shadow-form-host';
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.append(style.cloneNode(true));
    const surface = mount(FormResetFixture, { target: shadow });
    return () => { void unmount(surface); };
  });
</script>

<iframe title="Embedded shadow form" width="600" height="650" bind:this={frame}></iframe>
