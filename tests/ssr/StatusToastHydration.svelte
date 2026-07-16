<script lang="ts">
  import StatusToast from '../../src/lib/components/StatusToast.svelte';
  import type { ZdpStatusToastItem } from '../../src/lib/toast';

  const primaryItems: readonly ZdpStatusToastItem[] = [
    {
      id: 'saved-draft',
      title: 'Draft saved',
      message: 'Your changes are ready to review.'
    }
  ];

  const secondaryItems: readonly ZdpStatusToastItem[] = [
    {
      id: 'sync-complete',
      title: 'Sync complete',
      message: 'The latest changes are available.'
    }
  ];
</script>

<section data-testid="status-toast-hydration-fixture" aria-label="Status toast hydration fixture">
  <StatusToast placement="inline" items={primaryItems} />
  <StatusToast placement="inline" items={secondaryItems} />
</section>
