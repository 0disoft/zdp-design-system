<script lang="ts">
  import Popover from '../../../src/lib/components/Popover.svelte';
</script>

<Popover let:close>
  <svelte:fragment slot="trigger" let:toggle let:open let:panelId>
    <button type="button" data-testid="frame-popover-trigger" onclick={toggle} aria-controls={open ? panelId : undefined} aria-expanded={open}>
      Embedded filters
    </button>
  </svelte:fragment>
  <button type="button" data-testid="frame-popover-action" onclick={() => close()}>Apply embedded filters</button>
</Popover>
<button type="button" data-testid="frame-popover-outside" style="display:block;margin-block-start:8rem">Outside embedded filters</button>
