<script lang="ts">
  import { onMount } from 'svelte';
  import PopoverEdges from '../../../stories/PopoverEdges.svelte';
  let enabled = false;
  let settings: {
    placement: 'top' | 'right' | 'bottom' | 'left';
    align: 'start' | 'center' | 'end';
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    direction: 'ltr' | 'rtl';
    count: number;
  } = { placement: 'bottom', align: 'end', corner: 'bottom-right', direction: 'ltr', count: 1 };
  onMount(() => {
    const configure = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === null) enabled = false;
      else { settings = { ...settings, ...detail }; enabled = true; }
    };
    window.addEventListener('zdp-test-popover-geometry', configure);
    return () => window.removeEventListener('zdp-test-popover-geometry', configure);
  });
</script>
{#if enabled}<PopoverEdges {...settings} />{/if}
