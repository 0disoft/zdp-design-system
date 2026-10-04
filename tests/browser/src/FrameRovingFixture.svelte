<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import styles from '../../../src/styles/index.css?inline';
  import FrameRovingSurface from './FrameRovingSurface.svelte';
  let frame: HTMLIFrameElement;

  onMount(() => {
    const document = frame.contentDocument;
    if (!document) return;
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.append(style);
    const surface = mount(FrameRovingSurface, { target: document.body });
    return () => { void unmount(surface); };
  });
</script>

<iframe title="Embedded keyboard controls" width="600" height="420" bind:this={frame}></iframe>
