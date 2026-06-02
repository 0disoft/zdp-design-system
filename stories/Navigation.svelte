<script lang="ts">
  import Breadcrumb from '../src/lib/components/Breadcrumb.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Link from '../src/lib/components/Link.svelte';
  import SkipLink from '../src/lib/components/SkipLink.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Tabs from '../src/lib/components/Tabs.svelte';
</script>

<SkipLink href="#navigation-main">본문으로 건너뛰기</SkipLink>

<main class="component-story zdp-surface-reset" id="navigation-main" lang="ko" tabindex="-1">
  <header class="component-story__header">
    <p>Navigation</p>
    <h1>Finding your place</h1>
  </header>

  <div class="component-story__grid">
    <section class="component-story__panel" data-zdp-theme="light" aria-labelledby="navigation-light-title">
      <h2 id="navigation-light-title">Light</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <h3>페이지 위치</h3>
            <Breadcrumb
              ariaLabel="현재 위치"
              items={[
                { label: '홈', href: '/' },
                { label: '플랫폼', href: '/platform' },
                { label: '디자인 시스템' }
              ]}
            />
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>텍스트 이동</h3>
            <Inline gap="md" align="center">
              <Link href="#navigation-main">자세히 보기</Link>
              <Link href="#navigation-main" tone="muted">기록 보기</Link>
              <Link href="#navigation-main" ariaCurrent="page">현재 페이지</Link>
            </Inline>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>가까운 섹션</h3>
            <Tabs
              ariaLabel="Light navigation sections"
              items={[
                { id: 'overview', label: '개요' },
                { id: 'changes', label: '변경' },
                { id: 'settings', label: '설정' }
              ]}
              selectedId="overview"
              let:selectedId
            >
              <strong>{selectedId === 'changes' ? '변경' : selectedId === 'settings' ? '설정' : '개요'}</strong>
              <p>가까운 내용은 페이지를 떠나지 않고 전환합니다.</p>
            </Tabs>
          </Stack>
        </Surface>
      </Stack>
    </section>

    <section class="component-story__panel" data-zdp-theme="dark" aria-labelledby="navigation-dark-title">
      <h2 id="navigation-dark-title">Dark</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <h3>페이지 위치</h3>
            <Breadcrumb
              ariaLabel="현재 위치"
              items={[
                { label: '홈', href: '/' },
                { label: '플랫폼', href: '/platform' },
                { label: '디자인 시스템' }
              ]}
            />
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>텍스트 이동</h3>
            <Inline gap="md" align="center">
              <Link href="#navigation-main">자세히 보기</Link>
              <Link href="#navigation-main" tone="muted">기록 보기</Link>
              <Link href="#navigation-main" ariaCurrent="page">현재 페이지</Link>
            </Inline>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>가까운 섹션</h3>
            <Tabs
              ariaLabel="Dark navigation sections"
              items={[
                { id: 'overview', label: '개요' },
                { id: 'changes', label: '변경' },
                { id: 'settings', label: '설정' }
              ]}
              selectedId="overview"
              let:selectedId
            >
              <strong>{selectedId === 'changes' ? '변경' : selectedId === 'settings' ? '설정' : '개요'}</strong>
              <p>어두운 화면에서도 같은 위치 규칙을 유지합니다.</p>
            </Tabs>
          </Stack>
        </Surface>
      </Stack>
    </section>
  </div>
</main>

<style>
  .component-story {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-8);
    min-height: 100vh;
    padding: var(--zdp-space-8);
  }

  .component-story:focus {
    outline: 0;
  }

  .component-story__header {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .component-story__header p {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
    margin: 0;
    text-transform: uppercase;
  }

  .component-story__header h1 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: 3rem;
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
  }

  .component-story__grid {
    display: grid;
    gap: var(--zdp-space-6);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .component-story__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-5);
    padding: var(--zdp-space-6);
  }

  .component-story__panel h2,
  .component-story__panel h3 {
    color: var(--zdp-color-ink-strong);
    margin: 0;
  }

  .component-story__panel h2 {
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
  }

  .component-story__panel h3 {
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  .component-story__panel p {
    color: var(--zdp-color-ink-muted);
    line-height: var(--zdp-type-body-line-height);
    margin: 0;
  }

  @media (max-width: 860px) {
    .component-story {
      padding: var(--zdp-space-4);
    }

    .component-story__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
