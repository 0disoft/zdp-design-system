<script lang="ts">
  import Input from '../../../src/lib/components/Input.svelte';
  import Textarea from '../../../src/lib/components/Textarea.svelte';
  import Checkbox from '../../../src/lib/components/Checkbox.svelte';
  import Radio from '../../../src/lib/components/Radio.svelte';
  import Switch from '../../../src/lib/components/Switch.svelte';
  import Select from '../../../src/lib/components/Select.svelte';
  import Combobox from '../../../src/lib/components/Combobox.svelte';
  import CommandField from '../../../src/lib/components/CommandField.svelte';
  import Button from '../../../src/lib/components/Button.svelte';
  import ConfirmAction from '../../../src/lib/components/ConfirmAction.svelte';
  import IconButton from '../../../src/lib/components/IconButton.svelte';
  import Menu from '../../../src/lib/components/Menu.svelte';
  import Disclosure from '../../../src/lib/components/Disclosure.svelte';
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import SegmentedControl from '../../../src/lib/components/SegmentedControl.svelte';
  import TextScaleControl from '../../../src/lib/components/TextScaleControl.svelte';
  import LocaleSwitcher from '../../../src/lib/components/LocaleSwitcher.svelte';
  import ResizableSplitPane from '../../../src/lib/components/ResizableSplitPane.svelte';
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
      <ConfirmAction label="Confirm action" hint="Hold to confirm" durationMs={60000} />
      <IconButton variant="solid" ariaLabel="Primary icon action"><span aria-hidden="true">+</span></IconButton>
      <div data-testid="validation-controls" style="display:grid;gap:12px;">
        <Input ariaLabel="Invalid name" invalid />
        <Textarea ariaLabel="Invalid note" invalid />
        <label for={`invalid-status-${theme}-${direction}`}>Invalid status</label>
        <Select id={`invalid-status-${theme}-${direction}`} invalid><option>Review needed</option></Select>
        <Combobox label="Invalid owner" invalid options={[{id:'team',value:'team',label:'Platform team'}]} />
        <Checkbox invalid>Invalid checkbox</Checkbox>
        <Radio name={`invalid-radio-${theme}-${direction}`} value="weekly" invalid>Invalid radio</Radio>
        <Switch invalid>Invalid switch</Switch>
      </div>
      <div data-testid="disabled-controls" style="display:grid;gap:12px;">
        <Input ariaLabel="Disabled name" disabled value="Name" />
        <Textarea ariaLabel="Disabled note" disabled value="Note" />
        <Select disabled><option>Platform team</option></Select>
        <Combobox label="Disabled owner" disabled options={[{id:'team',value:'team',label:'Platform team'}]} />
        <Button disabled>Disabled action</Button>
        <Checkbox disabled>Disabled checkbox</Checkbox>
        <Radio name={`disabled-radio-${theme}-${direction}`} value="weekly" disabled>Disabled radio</Radio>
        <Switch disabled>Disabled switch</Switch>
        <div style="height:160px;">
          <ResizableSplitPane disabled orientation="horizontal" minSize={32} maxSize={96} defaultSize={64} />
        </div>
      </div>
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
