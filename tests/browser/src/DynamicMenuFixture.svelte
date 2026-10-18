<script lang="ts">
  import { onMount } from 'svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import type { ZdpMenuItem } from '../../../src/lib/menu';

  let items: readonly ZdpMenuItem[] = [
    { id: 'first', label: 'Dynamic first' },
    { id: 'second', label: 'Dynamic second' },
    { id: 'third', label: 'Dynamic third' }
  ];
  let selections = 0;
  onMount(() => {
    const update = (event: Event) => { items = (event as CustomEvent<readonly ZdpMenuItem[]>).detail; };
    window.addEventListener('zdp-test-menu-items', update);
    return () => window.removeEventListener('zdp-test-menu-items', update);
  });
</script>

<section data-testid="dynamic-menu-fixture">
  <button type="button" data-testid="dynamic-menu-before">Before dynamic menu</button>
  <Menu {items} triggerLabel="Dynamic actions" onSelect={() => selections += 1} />
  <button type="button" data-testid="dynamic-menu-outside">Outside dynamic menu</button>
  <output data-testid="dynamic-menu-selections">{selections}</output>
</section>
