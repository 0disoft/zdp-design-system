<script lang="ts">
  import StatusToast from '../../../src/lib/components/StatusToast.svelte';
  import type { ZdpStatusToastItem } from '../../../src/lib/toast';
  const initialItems: readonly ZdpStatusToastItem[] = ['First', 'Middle', 'Last'].map((title) => ({
    id: title, title, message: 'Finished saving.', dismissLabel: `Dismiss ${title}`
  }));
  let items = $state(initialItems);
  let behavior = $state('remove');
  let outside: HTMLButtonElement;
  function dismiss(_event: MouseEvent, item: ZdpStatusToastItem): void {
    if (behavior !== 'keep') items = items.filter((candidate) => candidate.id !== item.id);
    if (behavior === 'outside') outside.focus();
  }
</script>

<section data-testid="toast-focus">
  <select aria-label="Toast dismissal behavior" bind:value={behavior}>
    <option value="remove">Remove</option><option value="keep">Keep</option><option value="outside">Move outside</option>
  </select>
  <button type="button" data-testid="reset" onclick={() => items = initialItems}>Restore toasts</button>
  <button type="button" data-testid="outside" bind:this={outside}>Outside notifications</button>
  <StatusToast {items} placement="inline" ariaLabel="Focus notifications" onDismiss={dismiss} />
</section>
