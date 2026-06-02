<script lang="ts">
  import Badge from '../src/lib/components/Badge.svelte';
  import Callout from '../src/lib/components/Callout.svelte';
  import Divider from '../src/lib/components/Divider.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Feedback</p>
    <h1>Status and surfaces</h1>
  </header>

  <div class="component-story__grid">
    <section class="component-story__panel" data-zdp-theme="light" aria-labelledby="feedback-light-title">
      <h2 id="feedback-light-title">Light</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md" align="start">
            <h3>상태</h3>
            <Inline gap="sm" align="center">
              <Badge tone="primary">검토 중</Badge>
              <Badge tone="success">정상</Badge>
              <Badge tone="warning">대기</Badge>
              <Badge tone="danger">주의</Badge>
            </Inline>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <Callout tone="info" labelledBy="feedback-light-info" semanticRole="note">
              <strong id="feedback-light-info">다음 단계가 준비됐습니다.</strong>
              <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
            </Callout>
            <Divider />
            <Callout tone="danger" labelledBy="feedback-light-danger" semanticRole="alert">
              <strong id="feedback-light-danger">삭제 전에 다시 확인하세요.</strong>
              <p>되돌릴 수 없는 작업은 별도 확인 흐름과 함께 사용합니다.</p>
            </Callout>
          </Stack>
        </Surface>

        <div class="surface-pair">
          <Surface padding="lg">
            <span class="surface-kicker">Parchment</span>
            <strong>작업을 펼치는 자리</strong>
            <p>내용과 다음 액션이 차분하게 올라옵니다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Banner</span>
            <strong>중요한 조각만 앞으로</strong>
            <p>목록과 작은 알림을 과하게 튀지 않게 구분합니다.</p>
          </Surface>
        </div>
      </Stack>
    </section>

    <section class="component-story__panel" data-zdp-theme="dark" aria-labelledby="feedback-dark-title">
      <h2 id="feedback-dark-title">Dark</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md" align="start">
            <h3>상태</h3>
            <Inline gap="sm" align="center">
              <Badge tone="primary">검토 중</Badge>
              <Badge tone="success">정상</Badge>
              <Badge tone="warning">대기</Badge>
              <Badge tone="danger">주의</Badge>
            </Inline>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <Callout tone="info" labelledBy="feedback-dark-info" semanticRole="note">
              <strong id="feedback-dark-info">다음 단계가 준비됐습니다.</strong>
              <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
            </Callout>
            <Divider />
            <Callout tone="danger" labelledBy="feedback-dark-danger" semanticRole="alert">
              <strong id="feedback-dark-danger">삭제 전에 다시 확인하세요.</strong>
              <p>어두운 표면에서도 위험 상태는 같은 의미를 유지합니다.</p>
            </Callout>
          </Stack>
        </Surface>

        <div class="surface-pair">
          <Surface padding="lg">
            <span class="surface-kicker">Parchment</span>
            <strong>어두운 배경의 작업지</strong>
            <p>톤은 낮추되 경계와 초점은 또렷하게 남깁니다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Banner</span>
            <strong>중요한 조각만 앞으로</strong>
            <p>짙은 잉크 위에서도 작은 정보가 묻히지 않습니다.</p>
          </Surface>
        </div>
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

  .component-story__grid,
  .surface-pair {
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

  .surface-kicker {
    color: var(--zdp-color-accent-danger);
    display: block;
    font-size: var(--zdp-type-caption-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-caption-line-height);
    margin-bottom: var(--zdp-space-2);
  }

  .surface-pair strong {
    color: var(--zdp-color-ink-strong);
    display: block;
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  .surface-pair p {
    color: var(--zdp-color-ink-muted);
    line-height: var(--zdp-type-body-line-height);
    margin: var(--zdp-space-2) 0 0;
  }

  @media (max-width: 860px) {
    .component-story {
      padding: var(--zdp-space-4);
    }

    .component-story__grid,
    .surface-pair {
      grid-template-columns: 1fr;
    }
  }
</style>
