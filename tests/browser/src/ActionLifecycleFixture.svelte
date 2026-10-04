<script lang="ts">
  import ConfirmAction from '../../../src/lib/components/ConfirmAction.svelte';
  import CodeBlock from '../../../src/lib/components/CodeBlock.svelte';

  let confirmationCount = 0;
  let invalidDuration = Number.NaN;
  let invalidConfirmationCount = 0;
  let code = 'alpha';
  let codeMounted = true;
</script>

<section data-testid="action-lifecycle">
  <ConfirmAction
    id="repeat-confirm-action"
    label="Confirm repeated hold"
    durationMs={600}
    onconfirm={() => (confirmationCount += 1)}
  />
  <output data-testid="repeat-confirm-count">{confirmationCount}</output>
  <ConfirmAction
    id="invalid-duration-confirm-action"
    label="Confirm duration validation"
    durationMs={invalidDuration}
    onconfirm={() => (invalidConfirmationCount += 1)}
  />
  <output data-testid="invalid-duration-confirm-count">{invalidConfirmationCount}</output>
  <button type="button" data-testid="confirm-duration-infinity" onclick={() => invalidDuration = Infinity}>Use infinite duration</button>
  <button type="button" data-testid="confirm-duration-overflow" onclick={() => invalidDuration = 2_147_483_648}>Use overflowing duration</button>
  <div data-testid="copy-lifecycle">
    {#if codeMounted}
      <CodeBlock {code} label="Copy lifecycle" />
    {/if}
    <button type="button" data-testid="replace-copy-code" onclick={() => (code = code === 'alpha' ? 'beta' : 'alpha')}>
      Replace code
    </button>
    <button type="button" data-testid="toggle-copy-mount" onclick={() => (codeMounted = !codeMounted)}>
      Toggle code block
    </button>
  </div>
</section>
