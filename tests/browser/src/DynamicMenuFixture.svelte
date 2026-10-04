<script lang="ts">
  import { onMount } from 'svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import type { ZdpMenuItem } from '../../../src/lib/menu';

  let items: readonly ZdpMenuItem[] = [
    { id: 'first', label: 'Dynamic first' },
    { id: 'second', label: 'Dynamic second' },
    { id: 'third', label: 'Dynamic third' }
  ];
  onMount(() => {
    const update = (event: Event) => { items = (event as CustomEvent<readonly ZdpMenuItem[]>).detail; };
    window.addEventListener('zdp-test-menu-items', update);
    return () => window.removeEventListener('zdp-test-menu-items', update);
  });
</script>

<section data-testid="dynamic-menu-fixture">
  <Menu {items} triggerLabel="Dynamic actions" />
  <button type="button" data-testid="dynamic-menu-outside">Outside dynamic menu</button>
</section>
