<script lang="ts">
  import Menu from '../src/lib/components/Menu.svelte';
  export let placement: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
  export let align: 'start' | 'center' | 'end' = 'end';
  export let corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right';
  export let direction: 'ltr' | 'rtl' = 'ltr';
  export let count = 4;
  $: items = Array.from({ length: count }, (_, index) => ({
    id: `edge-${index}`,
    label: count > 4 ? `항목 ${index + 1} — 긴 메뉴에서도 내용을 확인할 수 있어요` : (['내용 수정', '링크 복사', '보관함 이동', '닫기'][index % 4] ?? '항목')
  }));
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Menu</p>
    <h1>화면 안에서 펼치기</h1>
    <p>모서리의 메뉴를 열어 보세요. 공간이 부족하면 방향과 위치를 조정해요.</p>
  </header>
  <div class={`edge-menu-anchor edge-menu-anchor--${corner}`} dir={direction} data-testid="edge-menu-anchor">
    <Menu {placement} {align} {items} triggerLabel="모서리 메뉴" />
  </div>
</main>

<style>
  .edge-menu-anchor {
    position: fixed;
  }
  .edge-menu-anchor--top-left,
  .edge-menu-anchor--top-right {
    top: var(--zdp-space-3);
  }
  .edge-menu-anchor--bottom-left,
  .edge-menu-anchor--bottom-right {
    bottom: var(--zdp-space-3);
  }
  .edge-menu-anchor--top-left,
  .edge-menu-anchor--bottom-left {
    left: var(--zdp-space-3);
  }
  .edge-menu-anchor--top-right,
  .edge-menu-anchor--bottom-right {
    right: var(--zdp-space-3);
  }
  .edge-menu-anchor--center {
    left: 50%;
    top: 50%;
    translate: -50% -50%;
  }
</style>
