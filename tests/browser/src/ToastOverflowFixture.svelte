<script lang="ts">
  import StatusToast from '../../../src/lib/components/StatusToast.svelte';
  import Toast from '../../../src/lib/components/Toast.svelte';
  import type { ZdpStatusToastItem } from '../../../src/lib/toast';
  const initialItems: readonly ZdpStatusToastItem[] = Array.from({ length: 8 }, (_, index) => ({
    id: `notice-${index}`, title: `Notification ${index + 1}`,
    message: 'A background task finished. Review the result before continuing.',
    dismissLabel: `Dismiss notification ${index + 1}`
  }));
  let items = $state(initialItems);
  let placement = $state<'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'>('inline');
</script>

<section data-testid="toast-overflow">
  <select aria-label="Overflow toast placement" bind:value={placement}>
    {#each ['inline', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] as value}
      <option {value}>{value}</option>
    {/each}
  </select>
  <button type="button" data-testid="reset" onclick={() => items = initialItems}>Restore notifications</button>
  <StatusToast {items} {placement} ariaLabel="Scrollable notifications" onDismiss={(_event, item) => items = items.filter((candidate) => candidate.id !== item.id)} />
</section>

<section data-testid="toast-long-title" style="width: min(100%, 320px)">
  <Toast dismissLabel="Dismiss long title" onClose={() => {}}>
    <strong>{`Backup_${'a'.repeat(90)}.zip`}</strong>
    <p>Finished saving the file.</p>
  </Toast>
  <StatusToast placement="inline" ariaLabel="Long title notifications" items={[{ id: 'long-title', title: `Report_${'b'.repeat(90)}.pdf`, message: 'Finished generating the report.' }]} onDismiss={() => {}} />
</section>
