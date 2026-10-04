<script lang="ts">
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';

  const alpha = { id: 'alpha', value: 'alpha', label: 'Alpha' };
  const beta = { id: 'beta', value: 'beta', label: 'Beta' };
  let options: readonly ZdpComboboxOption[] = [alpha, beta];
  let value = 'alpha';
  let query = '';
  let selectedOption: ZdpComboboxOption | null = alpha;
</script>

<section aria-label="Filtered selection contracts">
  <form id="filtered-selection-form">
    <Combobox label="Cached filtered choice" name="cached" options={options} bind:value bind:query required />
    <Combobox label="Authoritative filtered choice" name="authoritative" value="alpha" options={[beta]} {selectedOption} required />
    <Combobox label="Unknown filtered choice" name="unknown" value="missing" options={[]} required />
  </form>
  <button type="button" onclick={() => (options = [beta])}>Hide selected candidate</button>
  <button type="button" onclick={() => (options = [])}>Clear search candidates</button>
  <button type="button" onclick={() => (selectedOption = { ...alpha, label: 'Renamed Alpha' })}>Rename selected metadata</button>
  <button type="button" onclick={() => (selectedOption = { ...alpha, disabled: true })}>Disable selected metadata</button>
  <button type="button" onclick={() => (selectedOption = null)}>Invalidate selected metadata</button>
  <output data-testid="filtered-selection-value">{value}</output>
</section>
