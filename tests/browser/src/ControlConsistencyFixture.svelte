<script lang="ts">
  import Input from '../../../src/lib/components/Input.svelte';
  import Select from '../../../src/lib/components/Select.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import CommandField from '../../../src/lib/components/CommandField.svelte';
  import Button from '../../../src/lib/components/Button.svelte';
  import IconButton from '../../../src/lib/components/IconButton.svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import Disclosure from '../../../src/lib/components/Disclosure.svelte';
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import SegmentedControl from '../../../src/lib/components/SegmentedControl.svelte';
  import TextScaleControl from '../../../src/lib/components/TextScaleControl.svelte';
  import LocaleSwitcher from '../../../src/lib/components/LocaleSwitcher.svelte';
</script>

<div data-zdp-theme="dark">
{#each ['light', 'dark'] as theme}
  {#each ['ltr', 'rtl'] as direction}
    <section data-testid={`control-consistency-${theme}-${direction}`} data-zdp-theme={theme} dir={direction}
      style="display:grid;gap:12px;padding:16px;max-width:420px;background:var(--zdp-color-surface-canvas);">
      <span aria-hidden="true" data-testid="field-surface-reference" style="position:absolute;width:0;height:0;background:var(--zdp-color-surface-panel);"></span>
      <Input ariaLabel="Consistent input" placeholder="Name" />
      <Select><option>Platform team</option><option>Security team</option></Select>
      <Combobox label="Consistent selection" labelVisible={false} options={[{id:'team',value:'team',label:'Platform team'}]} />
      <CommandField label="Consistent search" shortcutKeys={[]} />
      <Button variant="secondary">Save</Button>
      <IconButton ariaLabel="Consistent icon action"><span aria-hidden="true">x</span></IconButton>
      <Menu triggerLabel="Consistent actions" items={[{id:'edit',label:'Edit'}]} />
      <Disclosure title="Consistent disclosure">Details</Disclosure>
      <Tabs ariaLabel="Consistent tabs" items={[{id:'one',label:'One'},{id:'two',label:'Two'}]} />
      <SegmentedControl ariaLabel="Consistent segments" items={[{id:'one',label:'One'},{id:'two',label:'Two'}]} />
      <TextScaleControl ariaLabel="Consistent text size" />
      <LocaleSwitcher ariaLabel="Consistent language" options={[{value:'en',label:'English'},{value:'ko',label:'한국어'}]} />
      <Button variant="primary">Primary action</Button>
      <IconButton variant="solid" ariaLabel="Primary icon action"><span aria-hidden="true">+</span></IconButton>
      <div data-testid="small-controls">
        <Combobox size="sm" label="Small selection" options={[{id:'team',value:'team',label:'Platform team'}]} />
        <CommandField size="sm" label="Small search" shortcutKeys={[]} />
        <Button size="sm" variant="secondary">Save</Button>
        <IconButton size="sm" ariaLabel="Small icon action"><span aria-hidden="true">x</span></IconButton>
      </div>
    </section>
  {/each}
{/each}
</div>
