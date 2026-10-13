<script lang="ts">
  import Popover from '../src/lib/components/Popover.svelte';
  export let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
  export let align: 'start' | 'center' | 'end' = 'end';
  export let corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right';
  export let direction: 'ltr' | 'rtl' = 'ltr';
  export let count = 1;
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Popover</p>
    <h1>화면 안에서 펼치기</h1>
    <p>모서리의 설정을 열어 보세요. 공간이 부족하면 방향과 위치를 조정해요.</p>
  </header>
  <div class={`edge-popover-anchor edge-popover-anchor--${corner}`} dir={direction} data-testid="edge-popover-anchor">
    <Popover {placement} {align} let:close>
      <button slot="trigger" class="zdp-button zdp-button--secondary" type="button" let:toggle let:open let:panelId
        aria-expanded={open} aria-controls={open ? panelId : undefined} onclick={toggle}>모서리 설정</button>
      {#each Array.from({ length: count }) as _, index}
        <p>{count > 1 ? `설정 ${index + 1} — 긴 내용도 패널 안에서 확인할 수 있어요.` : '필요한 설정을 확인하고 적용하세요.'}</p>
      {/each}
      <button type="button" class="zdp-button zdp-button--secondary" onclick={() => close()}>적용</button>
    </Popover>
  </div>
</main>

<style>
  .edge-popover-anchor { position: fixed; }
  .edge-popover-anchor--top-left,
  .edge-popover-anchor--top-right { top: var(--zdp-space-3); }
  .edge-popover-anchor--bottom-left,
  .edge-popover-anchor--bottom-right { bottom: var(--zdp-space-3); }
  .edge-popover-anchor--top-left,
  .edge-popover-anchor--bottom-left { left: var(--zdp-space-3); }
  .edge-popover-anchor--top-right,
  .edge-popover-anchor--bottom-right { right: var(--zdp-space-3); }
  .edge-popover-anchor--center { left: 50%; top: 50%; translate: -50% -50%; }
</style>
