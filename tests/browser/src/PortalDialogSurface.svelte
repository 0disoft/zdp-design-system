<script lang="ts">
  import Dialog from '../../../src/lib/components/Dialog.svelte';

  export let onClose: () => void;
</script>

<Dialog open labelledBy="portal-dialog-title" closeLabel="Close portal dialog" {onClose}>
  <svelte:fragment slot="title">
    <h2 id="portal-dialog-title">Portal dialog</h2>
  </svelte:fragment>
  <p>Rendered into a body-level portal host.</p>
  <svelte:fragment slot="footer">
    <button data-testid="portal-dialog-last-action" type="button">Review portal dialog</button>
  </svelte:fragment>
</Dialog>
