<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Stack from '../src/lib/components/Stack.svelte';

  let loading = true;
  const variants = ['primary', 'secondary', 'danger', 'text'] as const;
  const sizes = ['md', 'sm'] as const;
</script>

<Stack gap="md">
  <h3>처리 중인 작업</h3>
  {#each sizes as size}
    <Inline gap="sm" align="center">
      {#each variants as variant}
        <Button {variant} {size} {loading} onclick={() => loading = true}>
          {variant === 'danger' ? '삭제' : variant === 'text' ? '더 보기' : '저장'}
        </Button>
      {/each}
    </Inline>
  {/each}
  <Inline gap="sm" align="center">
    <Button variant="secondary" onclick={() => loading = !loading}>{loading ? '작업 완료' : '다시 시작'}</Button>
    <p role="status">{loading ? '작업을 처리하고 있어요.' : '처리가 끝났어요.'}</p>
  </Inline>
</Stack>

<style>
  h3, p {
    margin: 0;
  }

  h3 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  p {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }
</style>
