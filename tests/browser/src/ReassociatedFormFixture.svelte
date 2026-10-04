<script lang="ts">
  import Input from '../../../src/lib/components/Input.svelte';
  import Select from '../../../src/lib/components/Select.svelte';
  import Checkbox from '../../../src/lib/components/Checkbox.svelte';
  let text = $state('seed');
  let choice = $state('b');
  let checked = $state(true);
</script>

<section data-testid="reassociated-form">
  <form>
    <div data-testid="reassociated-controls">
      <Input name="text" ariaLabel="Reassociated text" bind:value={text} />
      <Select name="choice" bind:value={choice}><option value="a">A</option><option value="b">B</option></Select>
      <Checkbox name="checked" bind:checked>Reassociated checkbox</Checkbox>
    </div>
  </form>
  <output data-testid="reassociated-state">{JSON.stringify({ text, choice, checked })}</output>
</section>
