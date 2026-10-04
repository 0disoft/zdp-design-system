<script lang="ts">
  import LocaleSwitcher from '../../../src/lib/components/LocaleSwitcher.svelte';
  import TextScaleControl from '../../../src/lib/components/TextScaleControl.svelte';
  import SegmentedControl from '../../../src/lib/components/SegmentedControl.svelte';
  import type { ZdpLocaleSwitcherOption, ZdpTextScaleControlOption } from '../../../src/lib/preferences';
  import type { ZdpSegmentedControlItem } from '../../../src/lib/segmented';

  const initialLocales: ZdpLocaleSwitcherOption[] = [{ value: 'en', label: 'Focus English' }, { value: 'ko', label: 'Focus Korean' }];
  const initialScales: ZdpTextScaleControlOption[] = [{ value: 'base', label: 'Focus base' }, { value: 'large', label: 'Focus large' }];
  const initialSegments: ZdpSegmentedControlItem[] = [{ id: 'a', label: 'Focus alpha' }, { id: 'b', label: 'Focus beta' }];
  let locales = $state(initialLocales.map((item) => ({ ...item })));
  let scales = $state(initialScales.map((item) => ({ ...item })));
  let segments = $state(initialSegments.map((item) => ({ ...item })));
  let outside = $state<HTMLButtonElement>();

  function change(kind: string, operation: string): void {
    const transform = <T extends { disabled?: boolean }>(items: T[], initial: T[]): T[] => {
      if (operation === 'restore') return initial.map((item) => ({ ...item }));
      if (operation === 'disable-all') return items.map((item) => ({ ...item, disabled: true }));
      if (operation === 'remove' || operation === 'external') return items.slice(1);
      return items.map((item, index) => ({ ...item, disabled: index === 0 }));
    };
    if (kind === 'locale') locales = transform(locales, initialLocales);
    else if (kind === 'scale') scales = transform(scales, initialScales);
    else segments = transform(segments, initialSegments);
    if (operation === 'external') queueMicrotask(() => outside?.focus());
  }
</script>

{#each ['locale', 'scale', 'segment'] as kind}
  <section data-testid={`selection-focus-${kind}`}>
    {#if kind === 'locale'}
      <LocaleSwitcher options={locales} />
    {:else if kind === 'scale'}
      <TextScaleControl options={scales} />
    {:else}
      <SegmentedControl items={segments} />
    {/if}
    {#each ['restore', 'disable', 'remove', 'disable-all', 'external'] as operation}
      <button type="button" data-testid={`selection-${kind}-${operation}`} onclick={() => change(kind, operation)}>{operation}</button>
    {/each}
  </section>
{/each}
<button type="button" data-testid="selection-outside" bind:this={outside}>Outside selection controls</button>
