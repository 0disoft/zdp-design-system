<script lang="ts">
  import Tabs from '../../../src/lib/components/Tabs.svelte';
  import SegmentedControl from '../../../src/lib/components/SegmentedControl.svelte';
  import LocaleSwitcher from '../../../src/lib/components/LocaleSwitcher.svelte';
  import TextScaleControl from '../../../src/lib/components/TextScaleControl.svelte';
</script>

<Tabs ariaLabel="Embedded tabs" items={[{id:'a',label:'Frame tab A'},{id:'b',label:'Frame tab B'},{id:'c',label:'Frame tab C'}]} selectedId="b" />
<SegmentedControl ariaLabel="Embedded choices" items={[{id:'a',label:'Frame choice A'},{id:'b',label:'Frame choice B'},{id:'c',label:'Frame choice C'}]} selectedId="b" />
<LocaleSwitcher ariaLabel="Embedded languages" options={[{value:'a',label:'Frame language A'},{value:'b',label:'Frame language B'},{value:'c',label:'Frame language C'}]} value="b" />
<TextScaleControl ariaLabel="Embedded text sizes" options={[{value:'base',label:'Frame size A'},{value:'large',label:'Frame size B'},{value:'larger',label:'Frame size C'}]} value="large" />
