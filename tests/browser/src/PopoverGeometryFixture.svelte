<script lang="ts">
  import Popover from '../../../src/lib/components/Popover.svelte';
  let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
  let align: 'start' | 'center' | 'end' = 'start';
  let panelRole: 'dialog' | 'group' | null = 'dialog';
</script>

<section data-testid="popover-geometry">
  <div style="padding: 160px 350px;">
    <Popover {placement} {align} role={panelRole} describedBy="geometry-description">
      <svelte:fragment slot="trigger" let:toggle><button type="button" data-testid="geometry-trigger" onclick={toggle}>Geometry trigger</button></svelte:fragment>
      <p>Placement and alignment</p>
    </Popover>
  </div>
  <p id="geometry-description">Geometry panel description</p>
  <button type="button" data-testid="geometry-role-group" onclick={() => panelRole = 'group'}>Group panel</button>
  <button type="button" data-testid="geometry-role-none" onclick={() => panelRole = null}>Panel without role</button>
  {#each ['top', 'right', 'bottom', 'left'] as side}
    {#each ['start', 'center', 'end'] as alignment}
      <button type="button" data-testid={`geometry-${side}-${alignment}`} onclick={() => { placement = side as typeof placement; align = alignment as typeof align; }}>{side} {alignment}</button>
    {/each}
  {/each}
</section>
