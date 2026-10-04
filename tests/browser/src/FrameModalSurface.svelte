<script lang="ts">
  import Dialog from '../../../src/lib/components/Dialog.svelte';
  export let scope: string;
  let open = false;
</script>

<button type="button" data-testid={`frame-modal-${scope}-trigger`} onclick={() => open = true}>Open embedded dialog</button>
<Dialog bind:open labelledBy={`frame-modal-${scope}-title`} closeLabel="Close embedded dialog">
  <h2 slot="title" id={`frame-modal-${scope}-title`}>Embedded dialog</h2>
  <button type="button">Embedded action</button>
</Dialog>
