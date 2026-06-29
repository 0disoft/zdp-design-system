<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import ConfirmAction from '../src/lib/components/ConfirmAction.svelte';
  import Icon from '../src/lib/components/Icon.svelte';
  import IconButton from '../src/lib/components/IconButton.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import VisuallyHidden from '../src/lib/components/VisuallyHidden.svelte';

  let lightActionCount = 0;
  let lightConfirmCount = 0;
  let lightIconPressed = false;
  let darkActionCount = 0;
  let darkConfirmCount = 0;
  let darkIconPressed = false;
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Actions</p>
    <h1>Button states</h1>
  </header>

  <div class="component-story__grid">
    <section class="component-story__panel" data-zdp-theme="light" aria-labelledby="buttons-light-title">
      <h2 id="buttons-light-title">Light</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <h3>기본 작업</h3>
            <Inline gap="sm" align="center">
              <Button
                variant="primary"
                onclick={() => (lightActionCount += 1)}
                ariaControls="buttons-light-status"
                ariaExpanded={lightActionCount > 0}
              >
                저장
              </Button>
              <Button variant="secondary" ariaDescribedBy="buttons-light-status">
                <Icon size="sm">+</Icon>
                <VisuallyHidden>새 항목 </VisuallyHidden>추가
              </Button>
              <Button variant="danger">삭제</Button>
              <IconButton
                ariaLabel="추가"
                variant="solid"
                onclick={() => (lightIconPressed = !lightIconPressed)}
                ariaPressed={lightIconPressed}
              >
                +
              </IconButton>
            </Inline>
            <p id="buttons-light-status" class="story-status">
              {lightActionCount > 0 ? `저장 ${lightActionCount}회` : '저장 전'}
              · {lightIconPressed ? '추가 선택됨' : '추가 대기'}
            </p>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>비활성 작업</h3>
            <Inline gap="sm" align="center">
              <Button variant="primary" disabled>저장</Button>
              <Button variant="secondary" disabled><Icon size="sm">+</Icon>추가</Button>
              <Button variant="danger" disabled>삭제</Button>
              <IconButton ariaLabel="추가" variant="solid" disabled>+</IconButton>
            </Inline>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>중요한 작업</h3>
            <ConfirmAction
              label="밀어서 결제하기"
              hint="또는 2초간 누르기"
              completeLabel="결제 확인됨"
              onconfirm={() => (lightConfirmCount += 1)}
            />
            <p class="story-status">
              {lightConfirmCount > 0 ? `확인 ${lightConfirmCount}회` : '확인 전'}
            </p>
          </Stack>
        </Surface>
      </Stack>
    </section>

    <section class="component-story__panel" data-zdp-theme="dark" aria-labelledby="buttons-dark-title">
      <h2 id="buttons-dark-title">Dark</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <h3>기본 작업</h3>
            <Inline gap="sm" align="center">
              <Button
                variant="primary"
                onclick={() => (darkActionCount += 1)}
                ariaControls="buttons-dark-status"
                ariaExpanded={darkActionCount > 0}
              >
                저장
              </Button>
              <Button variant="secondary" ariaDescribedBy="buttons-dark-status">
                <Icon size="sm">+</Icon>
                <VisuallyHidden>새 항목 </VisuallyHidden>추가
              </Button>
              <Button variant="danger">삭제</Button>
              <IconButton
                ariaLabel="추가"
                variant="ghost"
                onclick={() => (darkIconPressed = !darkIconPressed)}
                ariaPressed={darkIconPressed}
              >
                +
              </IconButton>
            </Inline>
            <p id="buttons-dark-status" class="story-status">
              {darkActionCount > 0 ? `저장 ${darkActionCount}회` : '저장 전'}
              · {darkIconPressed ? '추가 선택됨' : '추가 대기'}
            </p>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>비활성 작업</h3>
            <Inline gap="sm" align="center">
              <Button variant="primary" disabled>저장</Button>
              <Button variant="secondary" disabled><Icon size="sm">+</Icon>추가</Button>
              <Button variant="danger" disabled>삭제</Button>
              <IconButton ariaLabel="추가" variant="ghost" disabled>+</IconButton>
            </Inline>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3>중요한 작업</h3>
            <ConfirmAction
              tone="danger"
              label="밀어서 삭제하기"
              hint="또는 2초간 누르기"
              completeLabel="삭제 확인됨"
              onconfirm={() => (darkConfirmCount += 1)}
            />
            <p class="story-status">
              {darkConfirmCount > 0 ? `확인 ${darkConfirmCount}회` : '확인 전'}
            </p>
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
    min-height: var(--zdp-viewport-block);
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
    font-size: var(--zdp-type-page-title-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-page-title-line-height);
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

  .story-status {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
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
