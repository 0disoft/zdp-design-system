<script lang="ts">
  import Combobox from '../src/lib/components/Combobox.svelte';
  export let corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right';
  export let direction: 'ltr' | 'rtl' = 'ltr';
  export let count = 4;
  let query = '';
  $: options = Array.from({ length: count }, (_, index) => ({
    id: `edge-${index}`, value: `value-${index}`, label: `담당 팀 ${index + 1}`, disabled: index === 1
  })).filter(option => option.label.includes(query));
</script>
<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header"><p>Combobox</p><h1>화면 안에서 선택하기</h1><p>담당 팀을 검색하고 선택하세요.</p></header>
  <form class={`edge-combobox-anchor edge-combobox-anchor--${corner}`} dir={direction} data-testid="edge-combobox-anchor">
    <Combobox {options} bind:query name="team" label="모서리 담당 팀" placeholder="담당 팀 찾기" />
  </form>
</main>
<style>
  .edge-combobox-anchor { position: fixed; width: min(260px, calc(100vw - 24px)); z-index: var(--zdp-layer-floating); }
  .edge-combobox-anchor--top-left,
  .edge-combobox-anchor--top-right { top: var(--zdp-space-3); }
  .edge-combobox-anchor--bottom-left,
  .edge-combobox-anchor--bottom-right { bottom: var(--zdp-space-3); }
  .edge-combobox-anchor--top-left,
  .edge-combobox-anchor--bottom-left { left: var(--zdp-space-3); }
  .edge-combobox-anchor--top-right,
  .edge-combobox-anchor--bottom-right { right: var(--zdp-space-3); }
  .edge-combobox-anchor--center { left: 50%; top: 50%; translate: -50% -50%; }
</style>
