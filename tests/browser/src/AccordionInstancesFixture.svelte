<script lang="ts">
  import Accordion from '../../../src/lib/components/Accordion.svelte';
  let changedItem = '';
  let changedOpenIds = '';
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
