<script lang="ts">
  import ConfirmAction from '../../../src/lib/components/ConfirmAction.svelte';

  let confirmationCount = 0;
</script>

<section data-testid="action-lifecycle">
  <ConfirmAction
    id="repeat-confirm-action"
    label="Confirm repeated hold"
    durationMs={600}
    onconfirm={() => (confirmationCount += 1)}
  />
  <output data-testid="repeat-confirm-count">{confirmationCount}</output>
</section>
