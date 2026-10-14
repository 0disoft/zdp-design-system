<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import IconButton from '../src/lib/components/IconButton.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Stack from '../src/lib/components/Stack.svelte';

  let loading = true;
  const variants = ['primary', 'secondary', 'danger', 'text'] as const;
  const sizes = ['md', 'sm'] as const;
  const iconVariants = ['solid', 'ghost'] as const;
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
  <h3>저장·새로고침 아이콘 버튼</h3>
  {#each sizes as size}
    <Inline gap="sm" align="center">
      {#each iconVariants as variant}
        <IconButton
          {variant}
          {size}
          {loading}
          ariaLabel={variant === 'solid' ? '저장' : '새로고침'}
          onclick={() => loading = true}
        >
          {#if variant === 'solid'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
              <path d="M7 3v4a1 1 0 0 0 1 1h7" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          {/if}
        </IconButton>
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
