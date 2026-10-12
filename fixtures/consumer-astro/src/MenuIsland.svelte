<script lang="ts">
  import Menu from 'zdp-design-system/components/Menu';
  import type { ZdpMenuItem } from 'zdp-design-system/menu';
  let selected = 'none';
  const items: readonly ZdpMenuItem[] = [
    { id: 'edit', label: 'Edit', onclick: () => (selected = 'edit') },
    { id: 'disabled', label: 'Disabled', disabled: true },
    { id: 'archive', label: 'Archive', onclick: () => (selected = 'archive') }
  ];
</script>

<Menu {items} triggerLabel="Astro actions" idPrefix="astro-menu">
  <svelte:fragment slot="trigger">Astro actions</svelte:fragment>
</Menu>
<output>{selected}</output>
