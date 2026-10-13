<script lang="ts">
  import { onMount } from 'svelte';
  import ComboboxEdges from '../../../stories/ComboboxEdges.svelte';
  let enabled = false;
  let settings: {
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    direction: 'ltr' | 'rtl'; count: number;
  } = { corner: 'bottom-right', direction: 'ltr', count: 4 };
  onMount(() => {
    const configure = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === null) enabled = false;
      else { settings = { ...settings, ...detail }; enabled = true; }
    };
    window.addEventListener('zdp-test-combobox-geometry', configure);
    return () => window.removeEventListener('zdp-test-combobox-geometry', configure);
  });
</script>
{#if enabled}<ComboboxEdges {...settings} />{/if}
