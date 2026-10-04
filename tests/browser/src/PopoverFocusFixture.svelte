<script lang="ts">
  import { mount, onMount, unmount } from 'svelte';
  import Popover from '../../../src/lib/components/Popover.svelte';
  import PopoverFocusFixture from './PopoverFocusFixture.svelte';
  let { embedded = false }: { embedded?: boolean } = $props();
  let open = $state(false);
  let outside: HTMLButtonElement;
  let shadowHost: HTMLDivElement;
  onMount(() => {
    if (embedded) return;
    const shadow = shadowHost.attachShadow({ mode: 'open' });
    const instance = mount(PopoverFocusFixture, { target: shadow, props: { embedded: true } });
    return () => { void unmount(instance); };
  });
</script>

<section data-testid={embedded ? 'shadow-popover-focus' : 'popover-focus'}>
  <Popover bind:open let:close>
    <button slot="trigger" type="button" let:toggle onclick={toggle}>Bound popover trigger</button>
    <input aria-label="Bound popover editor" />
    <button type="button" data-testid="close-without-restore" onclick={() => close(false)}>Close without restoring</button>
    <button type="button" data-testid="close" onclick={() => open = false}>Close from parent</button>
    <button type="button" data-testid="close-outside" onclick={() => { open = false; queueMicrotask(() => outside.focus()); }}>Close and move focus</button>
    <button type="button" data-testid="close-document-outside" onclick={() => { open = false; queueMicrotask(() => outside.ownerDocument.querySelector<HTMLButtonElement>('[data-testid="document-popover-outside"]')?.focus()); }}>Close and leave shadow root</button>
  </Popover>
  <button type="button" data-testid="outside" bind:this={outside}>Outside popover</button>
</section>
{#if !embedded}
  <div bind:this={shadowHost}></div>
  <button type="button" data-testid="document-popover-outside">Outside shadow root</button>
{/if}
