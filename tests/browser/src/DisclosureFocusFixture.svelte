<script lang="ts">
  import Disclosure from '../../../src/lib/components/Disclosure.svelte';
  let open = $state(false);
  let disabled = $state(false);
  let headingLevel = $state<2 | null>(2);
  let outside: HTMLButtonElement;
</script>

<section data-testid="disclosure-focus">
  <Disclosure bind:open {disabled} {headingLevel} title="Collapsible editor">
    <input aria-label="Disclosure editor" />
  </Disclosure>
  <button type="button" data-testid="reset" onclick={() => { disabled = false; open = true; }}>Open editor</button>
  <button type="button" data-testid="collapse" onclick={() => open = false}>Collapse editor</button>
  <button type="button" data-testid="collapse-disabled" onclick={() => { disabled = true; open = false; }}>Disable and collapse</button>
  <button type="button" data-testid="collapse-outside" onclick={() => { open = false; queueMicrotask(() => outside.focus()); }}>Collapse and move focus</button>
  <button type="button" data-testid="heading" onclick={() => headingLevel = headingLevel === null ? 2 : null}>Toggle heading</button>
  <button type="button" data-testid="outside" bind:this={outside}>Outside disclosure</button>
</section>
