<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import styles from '../../../src/styles/index.css?inline';
  import FrameModalSurface from './FrameModalSurface.svelte';
  let frame: HTMLIFrameElement;

  onMount(() => {
    const frameDocument = frame.contentDocument;
    if (!frameDocument) return;
    const style = frameDocument.createElement('style');
    style.textContent = styles;
    frameDocument.head.append(style);
    const native = frameDocument.createElement('button');
    native.dataset.testid = 'frame-modal-native-outside';
    native.textContent = 'Native background action';
    const inert = frameDocument.createElement('button');
    inert.dataset.testid = 'frame-modal-already-inert';
    inert.inert = true;
    frameDocument.body.append(native, inert);
    const surface = mount(FrameModalSurface, { target: frameDocument.body, props: { scope: 'body' } });
    // Both the host and its shadow root retain the parent document's realm.
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    frameDocument.body.append(host);
    shadow.append(style.cloneNode(true));
    const shadowSurface = mount(FrameModalSurface, { target: shadow, props: { scope: 'shadow' } });
    return () => { void unmount(surface); void unmount(shadowSurface); };
  });
</script>

<iframe title="Embedded modal document" width="600" height="320" bind:this={frame}></iframe>
