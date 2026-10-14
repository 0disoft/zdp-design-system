<script lang="ts">
  import ConfirmAction from '../../../src/lib/components/ConfirmAction.svelte';

  let pending = false;
  let unavailable = false;
  let confirmations = 0;
  const tones = ['primary', 'danger'] as const;
</script>

<section data-testid="confirm-pending-fixture" data-zdp-theme="light" aria-label="Pending confirmation actions">
  <button type="button" data-testid="confirm-pending-toggle" onclick={() => pending = !pending}>Toggle pending</button>
  <button type="button" data-testid="confirm-pending-disable" onclick={() => unavailable = !unavailable}>Toggle unavailable</button>
  <div data-testid="confirm-pending-actions" style="display:flex;flex-wrap:wrap;gap:12px;padding:12px">
    {#each tones as tone}
      <ConfirmAction
        id={`pending-confirm-${tone}`}
        {tone}
        {pending}
        disabled={unavailable && tone === 'danger'}
        label={`Confirm ${tone}`}
        hint="Hold or slide to confirm"
        pendingLabel={`Processing ${tone}`}
        pendingHint="Wait for the result"
        durationMs={600}
        onconfirm={() => { confirmations += 1; pending = true; }}
      />
    {/each}
  </div>
  <output data-testid="confirm-pending-count">{confirmations}</output>
</section>
