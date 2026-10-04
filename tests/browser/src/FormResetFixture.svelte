<script lang="ts">
  import Input from '../../../src/lib/components/Input.svelte';
  import Textarea from '../../../src/lib/components/Textarea.svelte';
  import Select from '../../../src/lib/components/Select.svelte';
  import Checkbox from '../../../src/lib/components/Checkbox.svelte';
  import Switch from '../../../src/lib/components/Switch.svelte';
  import Radio from '../../../src/lib/components/Radio.svelte';
  import CommandField from '../../../src/lib/components/CommandField.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';

  let text = 'seed';
  let notes = 'note';
  let choice = 'b';
  let checked = true;
  let switched = true;
  let radio: string | null = 'b';
  let command = 'find';
  let combo = 'beta';
  let query = '';
  let external = 'outside';
  let cancelReset = false;
  let asyncChoice = 'b';
  let asyncOptionsLoaded = false;
  let asyncOptionsRevision = 0;
  let cancelAsyncReset = false;
  const options = [{ id: 'alpha', value: 'alpha', label: 'Alpha' }, { id: 'beta', value: 'beta', label: 'Beta' }];

  function edit(): void {
    text = notes = external = 'edited';
    choice = radio = 'a';
    checked = switched = false;
    command = 'changed';
    combo = 'alpha';
  }
</script>

<section aria-label="Form reset contracts">
  <form id="reset-native-form" onreset={(event) => { if (cancelReset) event.preventDefault(); }}>
    <Input ariaLabel="Reset text" name="text" bind:value={text} />
    <Textarea ariaLabel="Reset notes" name="notes" bind:value={notes} />
    <label for="reset-choice">Reset choice</label>
    <Select id="reset-choice" name="choice" bind:value={choice}><option value="a">A</option><option value="b">B</option></Select>
    <Checkbox name="checked" bind:checked={checked}>Reset checked</Checkbox>
    <Switch name="switched" bind:checked={switched}>Reset switched</Switch>
    <Radio name="radio" value="a" bind:selectedValue={radio}>Reset radio A</Radio>
    <Radio name="radio" value="b" bind:selectedValue={radio}>Reset radio B</Radio>
    <CommandField label="Reset command" name="command" bind:value={command} />
    <Combobox label="Reset combo" name="combo" bind:value={combo} bind:query options={options} required />
    <button type="reset">Reset values</button>
  </form>
  <Input ariaLabel="External reset text" form="reset-native-form" name="external" bind:value={external} />
  <label><input type="checkbox" bind:checked={cancelReset} />Cancel reset</label>
  <button type="button" onclick={edit}>Edit reset values</button>
  <output data-testid="reset-bound-state">{JSON.stringify({ text, notes, choice, checked, switched, radio, command, combo, query, external })}</output>
  <form id="async-reset-form" onreset={(event) => { if (cancelAsyncReset) event.preventDefault(); }}>
    <label for="async-reset-choice">Async reset choice</label>
    <Select id="async-reset-choice" name="asyncChoice" bind:value={asyncChoice}>
      {#key asyncOptionsRevision}
        {#if asyncOptionsLoaded}
          <option value="a">Async A</option><option value="b">Async B</option>
        {/if}
      {/key}
    </Select>
    <button type="reset">Reset async choice</button>
  </form>
  <label><input type="checkbox" bind:checked={cancelAsyncReset} />Cancel async reset</label>
  <button type="button" onclick={() => (asyncOptionsLoaded = true)}>Load reset options</button>
  <button type="button" onclick={() => (asyncOptionsRevision += 1)}>Replace reset options</button>
  <output data-testid="async-reset-value">{asyncChoice}</output>
</section>
