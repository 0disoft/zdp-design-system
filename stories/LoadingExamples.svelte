<script lang="ts">
  import Inline from '../src/lib/components/Inline.svelte';
  import Progress from '../src/lib/components/Progress.svelte';
  import Skeleton from '../src/lib/components/Skeleton.svelte';
  import Spinner from '../src/lib/components/Spinner.svelte';

  export let idPrefix: string;
  export let headingTag: 'h3' | 'strong' = 'h3';

  const sizes = [
    { size: 'sm', label: '작게' },
    { size: 'md', label: '기본' },
    { size: 'lg', label: '크게' }
  ] as const;
  const tones = [
    { tone: 'neutral', label: '확인 중' },
    { tone: 'success', label: '완료 확인 중' },
    { tone: 'warning', label: '응답 대기 중' },
    { tone: 'danger', label: '복구 확인 중' }
  ] as const;
</script>

<div class="loading-examples" data-loading-examples={idPrefix}>
  <svelte:element this={headingTag} class="loading-examples__title" id={`${idPrefix}-title`}>진행</svelte:element>

  <div class="loading-examples__group">
    <p id={`${idPrefix}-determinate-label`}>자료 불러오기 · 64%</p>
    <Progress value={64} labelledBy={`${idPrefix}-determinate-label`} describedBy={`${idPrefix}-desc`} />
    <p class="loading-examples__note" id={`${idPrefix}-desc`}>자료를 불러오는 중입니다.</p>
  </div>

  <div class="loading-examples__group">
    <p id={`${idPrefix}-waiting-label`}>응답 대기 중</p>
    <Progress tone="warning" labelledBy={`${idPrefix}-waiting-label`} describedBy={`${idPrefix}-waiting-desc`} />
    <p class="loading-examples__note" id={`${idPrefix}-waiting-desc`}>응답을 기다리고 있습니다.</p>
  </div>

  <div class="loading-examples__group" role="group" aria-label="불러오기 표시 크기">
    <p>목록 확인 중</p>
    <Inline gap="md" align="center">
      {#each sizes as { size, label }}
        <span class="loading-examples__spinner">
          <Spinner {size} label={`목록 확인 중 · ${label}`} />
          <span class="loading-examples__note">{label}</span>
        </span>
      {/each}
    </Inline>
  </div>

  <Inline gap="md" align="center">
    {#each tones as { tone, label }}
      <span class="loading-examples__spinner">
        <Spinner {tone} label={label} />
        <span class="loading-examples__note">{label}</span>
      </span>
    {/each}
  </Inline>

  <div class="loading-examples__group" role="group" aria-label="콘텐츠 불러오기">
    <Skeleton variant="text" lines={3} />
    <Skeleton variant="block" />
    <Skeleton variant="avatar" />
  </div>
</div>

<style>
  .loading-examples,
  .loading-examples__group {
    display: grid;
    min-width: 0;
  }

  .loading-examples {
    gap: var(--zdp-space-4);
  }

  .loading-examples__group {
    gap: var(--zdp-space-3);
  }

  .loading-examples__title,
  .loading-examples p {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
  }

  .loading-examples .loading-examples__title {
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  .loading-examples .loading-examples__note {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    font-weight: var(--zdp-font-weight-regular);
    line-height: var(--zdp-type-caption-line-height);
  }

  .loading-examples__spinner {
    align-items: center;
    display: inline-flex;
    gap: var(--zdp-space-2);
    min-width: 0;
  }
</style>
