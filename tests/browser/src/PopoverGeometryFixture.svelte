<script lang="ts">
  import Popover from '../../../src/lib/components/Popover.svelte';
  let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
  let align: 'start' | 'center' | 'end' = 'start';
</script>

<section data-testid="popover-geometry">
  <div style="padding: 160px 350px;">
    <Popover {placement} {align}>
      <svelte:fragment slot="trigger" let:toggle><button type="button" data-testid="geometry-trigger" onclick={toggle}>Geometry trigger</button></svelte:fragment>
      <p>Placement and alignment</p>
    </Popover>
  </div>
  {#each ['top', 'right', 'bottom', 'left'] as side}
    {#each ['start', 'center', 'end'] as alignment}
      <button type="button" data-testid={`geometry-${side}-${alignment}`} onclick={() => { placement = side as typeof placement; align = alignment as typeof align; }}>{side} {alignment}</button>
    {/each}
  {/each}
</section>
