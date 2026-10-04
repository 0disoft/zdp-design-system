<script lang="ts">
  import ConfirmAction from '../../../src/lib/components/ConfirmAction.svelte';
  import CodeBlock from '../../../src/lib/components/CodeBlock.svelte';

  let confirmationCount = 0;
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
