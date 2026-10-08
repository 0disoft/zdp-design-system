<script lang="ts">
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
  let mode = $state<'initial' | 'pending' | 'replacement' | 'initial-focus'>('initial');
  let mounted = $state(true);
  function focus(element: HTMLElement): void { element.focus(); }
</script>

<section data-testid="tooltip-lifecycle">
  <button type="button" data-testid="replace-text" onclick={() => mode = 'pending'}>Replace with text</button>
  <button type="button" data-testid="replace-focus" onclick={() => mode = 'replacement'}>Replace and focus</button>
  <button type="button" data-testid="unmount" onclick={() => mounted = false}>Remove tooltip</button>
  <button type="button" data-testid="mount-focused" onclick={() => { mode = 'initial-focus'; mounted = true; }}>Mount focused tooltip</button>
  <button type="button" data-testid="outside">Outside tooltip</button>
  {#if mounted}
    <Tooltip text="Save this item" let:describedBy>
      {#if mode === 'initial'}
        <button type="button" data-testid="trigger" aria-describedby={describedBy}>Save</button>
      {:else if mode === 'replacement'}
        <button type="button" data-testid="replacement" aria-describedby={describedBy} use:focus>Save again</button>
      {:else if mode === 'initial-focus'}
        <button type="button" data-testid="initial-focus" aria-describedby={describedBy} use:focus>Initially focused</button>
      {:else}
        <span>Saving</span>
      {/if}
    </Tooltip>
  {/if}
</section>
