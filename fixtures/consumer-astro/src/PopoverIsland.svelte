<script lang="ts">
  import Popover from 'zdp-design-system/components/Popover';
  let open = $state(false);
  let changes = $state<boolean[]>([]);
</script>

<Popover bind:open idPrefix="astro-popover" labelledBy="astro-popover-title" let:close
  onOpenChange={(value) => changes = [...changes, value]}>
  <button slot="trigger" type="button" let:toggle let:panelId aria-expanded={open}
    aria-controls={open ? panelId : undefined} onclick={toggle}>Astro filters</button>
  <h2 id="astro-popover-title">Astro filter panel</h2>
  <input aria-label="Astro filter value" />
  <button type="button" onclick={() => close()}>Apply filters</button>
</Popover>
<output data-testid="popover-events">{changes.join(',')}</output>
