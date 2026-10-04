<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import styles from '../../../src/styles/index.css?inline';
  import FramePopoverSurface from './FramePopoverSurface.svelte';
  let frame: HTMLIFrameElement;

  onMount(() => {
    const document = frame.contentDocument;
    if (!document) return;
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.append(style);
    const surface = mount(FramePopoverSurface, { target: document.body });
    return () => { void unmount(surface); };
  });
</script>

<iframe title="Embedded popover document" width="600" height="320" bind:this={frame}></iframe>
