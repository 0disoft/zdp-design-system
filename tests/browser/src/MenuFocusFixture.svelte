<script lang="ts">
  import { flushSync, mount, onMount, unmount } from 'svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import MenuFocusFixture from './MenuFocusFixture.svelte';

  let { embedded = false }: { embedded?: boolean } = $props();
  let open = $state(false);
  let outside: HTMLButtonElement;
  let shadowHost: HTMLDivElement;
  let fixture: HTMLElement;
  function changeMenu(action: string): void {
    if (action === 'reopen') {
      flushSync(() => open = false);
      open = true;
    } else {
      open = false;
      if (action === 'close-outside') queueMicrotask(() => outside.focus());
    }
  }
  onMount(() => {
    const change = (event: Event) => changeMenu((event as CustomEvent<string>).detail);
    fixture.addEventListener('zdp-test-menu-state', change);
    const instance = embedded ? null : mount(MenuFocusFixture, {
      target: shadowHost.attachShadow({ mode: 'open' }), props: { embedded: true }
    });
    return () => {
      fixture.removeEventListener('zdp-test-menu-state', change);
      if (instance) void unmount(instance);
    };
  });
</script>

<section data-testid={embedded ? 'shadow-menu-focus' : 'menu-focus'} bind:this={fixture}>
  <Menu bind:open triggerLabel="Bound menu trigger" items={[{ id: 'edit', label: 'Bound menu item' }]} />
  <button type="button" data-testid="close" onclick={() => changeMenu('close')}>Close from parent</button>
  <button type="button" data-testid="outside" bind:this={outside}>Outside bound menu</button>
</section>
{#if !embedded}
  <div bind:this={shadowHost}></div>
{/if}
