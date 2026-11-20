<script lang="ts">
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import type { ZdpComboboxOption } from '../../../src/lib/combobox';

  const alpha = { id: 'alpha', value: 'alpha', label: 'Alpha' };
  const beta = { id: 'beta', value: 'beta', label: 'Beta' };
  let options: readonly ZdpComboboxOption[] = [alpha, beta];
  let value = 'alpha';
  let query = '';
  let selectedOption: ZdpComboboxOption | null = alpha;
  let optionalValue = 'missing';
  let optionalClears = 0;
  let invalidatedValue = 'alpha';
  let invalidatedClears = 0;
  let autoSubmitForm: HTMLFormElement;
  let autoSubmittedValues = '';
  const editModes = ['required', 'optional'] as const;
  let editSubmissions = { required: [] as string[], optional: [] as string[] };
</script>

<section aria-label="Filtered selection contracts">
  <form id="filtered-selection-form">
    <Combobox label="Cached filtered choice" name="cached" options={options} bind:value bind:query required />
    <Combobox label="Authoritative filtered choice" name="authoritative" value="alpha" options={[beta]} {selectedOption} required />
    <Combobox label="Unknown filtered choice" name="unknown" value="missing" options={[]} required />
    <Combobox label="Optional authoritative choice" name="invalidated" bind:value={invalidatedValue} options={[beta]} {selectedOption}
      onValueChange={(next) => { if (next === '') invalidatedClears += 1; }} />
    <Combobox label="Optional unknown choice" name="optional" bind:value={optionalValue} options={[]}
      onValueChange={(next) => { if (next === '') optionalClears += 1; }} />
  </form>
  <button type="button" onclick={() => (options = [beta])}>Hide selected candidate</button>
  <button type="button" onclick={() => (options = [])}>Clear search candidates</button>
  <button type="button" onclick={() => (selectedOption = { ...alpha, label: 'Renamed Alpha' })}>Rename selected metadata</button>
  <button type="button" onclick={() => (selectedOption = { ...alpha, disabled: true })}>Disable selected metadata</button>
  <button type="button" onclick={() => (selectedOption = null)}>Invalidate selected metadata</button>
  <output data-testid="filtered-selection-value">{value}</output>
  <output data-testid="optional-selection-clears">{optionalClears}</output>
  <output data-testid="invalidated-selection-value">{invalidatedValue}</output>
  <output data-testid="invalidated-selection-clears">{invalidatedClears}</output>
  <form bind:this={autoSubmitForm} onsubmit={(event) => {
    event.preventDefault();
    const data = new FormData(autoSubmitForm);
    autoSubmittedValues += `${data.get('team')},`;
  }}>
    <Combobox label="Submit on selection" name="team" options={[alpha, beta]} required
      onValueChange={() => autoSubmitForm.requestSubmit()} />
  </form>
  <output data-testid="combobox-auto-submitted">{autoSubmittedValues}</output>

  {#each editModes as mode}
    <form id={`combobox-submit-on-edit-${mode}`} onsubmit={(event) => {
      event.preventDefault();
      const selected = String(new FormData(event.currentTarget).get('team'));
      editSubmissions[mode] = [...editSubmissions[mode], selected];
    }}>
      <Combobox label={`Submit on edit (${mode})`} name="team" options={[alpha, beta]} value="alpha" required={mode === 'required'}
        onQueryChange={() => document.forms.namedItem(`combobox-submit-on-edit-${mode}`)?.requestSubmit()} />
    </form>
    <output data-testid={`combobox-edit-submitted-${mode}`}>{JSON.stringify(editSubmissions[mode])}</output>
  {/each}
</section>
