<script lang="ts">
  import Accordion from '../../../src/lib/components/Accordion.svelte';
  import type { ZdpAccordionItem } from '../../../src/lib/disclosure';
  let changedItem = '';
  let changedOpenIds = '';
  const originals: readonly ZdpAccordionItem[] = [
    { id: 'first', title: 'First dynamic section', content: 'First' },
    { id: 'second', title: 'Second dynamic section', content: 'Second' }
  ];
  let dynamicItems = originals;
</script>

<section data-testid="accordion-instances">
  <Accordion
    ariaLabel="Account accordion"
    items={[{ id: 'general', title: 'Account general', content: 'Account content', open: true }]}
    onOpenChange={(item, _open, openIds) => { changedItem = item.id; changedOpenIds = openIds.join(','); }}
  />
  <Accordion ariaLabel="Service accordion" items={[{ id: 'general', title: 'Service general', content: 'Service content', open: true }]} />
  <output data-testid="accordion-change-item">{changedItem}</output>
  <output data-testid="accordion-change-open-ids">{changedOpenIds}</output>
</section>

<section data-testid="accordion-signature">
  <Accordion ariaLabel="Dynamic accordion" items={dynamicItems} />
  <button type="button" data-testid="replace-items" onclick={() => dynamicItems = [
    { id: 'first:false:false|second', title: 'Replacement section', content: 'Replacement' }
  ]}>Replace sections</button>
  <button type="button" data-testid="restore-items" onclick={() => dynamicItems = originals}>Restore sections</button>
</section>
