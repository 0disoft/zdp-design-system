<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import Icon from '../src/lib/components/Icon.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import VisuallyHidden from '../src/lib/components/VisuallyHidden.svelte';

  export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
  export let size: 'sm' | 'md' = 'md';
  export let label = '저장';
  export let disabled = false;
  export let showIcon = false;
  export let ariaKeyShortcuts: string | null = null;

  let clickCount = 0;
</script>

<main class="button-playground zdp-surface-reset" lang="ko">
  <Surface padding="lg">
    <Stack gap="md">
      <h1>Button playground</h1>
      <p>Controls에서 라벨, 크기, 상태를 바꿔 같은 버튼 표면이 어떻게 버티는지 확인합니다.</p>
      <div class="button-playground__control">
        <Button
          {variant}
          {size}
          {disabled}
          {ariaKeyShortcuts}
          ariaDescribedBy="button-playground-status"
          onclick={() => (clickCount += 1)}
        >
          {#if showIcon}
            <Icon size="sm">+</Icon>
            <VisuallyHidden>새 항목 </VisuallyHidden>
          {/if}
          {label}
        </Button>
      </div>
      <p class="button-playground__status" id="button-playground-status">
        {disabled ? '비활성 상태' : clickCount > 0 ? `선택 ${clickCount}회` : '선택 전'}
      </p>
    </Stack>
  </Surface>
</main>

<style>
  .button-playground {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    min-height: var(--zdp-viewport-block);
    padding: var(--zdp-space-8);
  }

  .button-playground h1,
  .button-playground p {
    margin: 0;
  }

  .button-playground h1 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-type-title-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-title-line-height);
  }

  .button-playground__control {
    align-items: center;
    display: flex;
    min-height: var(--zdp-control-hit-target);
  }

  .button-playground__status {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }

  @media (max-width: 640px) {
    .button-playground {
      padding: var(--zdp-space-4);
    }
  }
</style>
