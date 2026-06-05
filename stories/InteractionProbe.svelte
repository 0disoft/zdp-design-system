<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import ConfirmAction from '../src/lib/components/ConfirmAction.svelte';
  import Dialog from '../src/lib/components/Dialog.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Tabs from '../src/lib/components/Tabs.svelte';

  let selectedId = 'overview';
  let dialogOpen = false;
  let confirmCount = 0;
</script>

<main class="interaction-probe zdp-surface-reset" lang="ko">
  <Surface padding="lg">
    <Stack gap="lg">
      <section aria-labelledby="interaction-probe-tabs-title">
        <Stack gap="md">
          <h1 id="interaction-probe-tabs-title">Interaction probe</h1>
          <Tabs
            idPrefix="interaction-probe-tabs"
            ariaLabel="검토 섹션"
            items={[
              { id: 'overview', label: '개요' },
              { id: 'history', label: '기록' },
              { id: 'disabled', label: '보류', disabled: true }
            ]}
            {selectedId}
            let:selectedId
          >
            <p id="interaction-probe-tab-state">
              {selectedId === 'history' ? '기록이 선택되었습니다.' : '개요가 선택되었습니다.'}
            </p>
          </Tabs>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-dialog-title">
        <Stack gap="md">
          <h2 id="interaction-probe-dialog-title">Dialog</h2>
          <Button
            variant="primary"
            ariaControls="interaction-probe-dialog"
            ariaExpanded={dialogOpen}
            onclick={() => (dialogOpen = true)}
          >
            검토 열기
          </Button>
          <Dialog
            open={dialogOpen}
            id="interaction-probe-dialog"
            labelledBy="interaction-probe-dialog-heading"
            describedBy="interaction-probe-dialog-desc"
            onClose={() => (dialogOpen = false)}
          >
            <h3 slot="title" id="interaction-probe-dialog-heading">변경 내용을 확인할까요?</h3>
            <p id="interaction-probe-dialog-desc">닫으면 검토 화면으로 돌아갑니다.</p>
            <svelte:fragment slot="footer">
              <Button variant="secondary" onclick={() => (dialogOpen = false)}>닫기</Button>
            </svelte:fragment>
          </Dialog>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-confirm-title">
        <Stack gap="md">
          <h2 id="interaction-probe-confirm-title">ConfirmAction</h2>
          <ConfirmAction
            label="길게 눌러 확인"
            hint="또는 오른쪽으로 밀기"
            completeLabel="확인됨"
            durationMs={600}
            onconfirm={() => (confirmCount += 1)}
          />
          <p id="interaction-probe-confirm-state">확인 {confirmCount}회</p>
        </Stack>
      </section>
    </Stack>
  </Surface>
</main>

<style>
  .interaction-probe {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    min-height: 100vh;
    padding: var(--zdp-space-8);
  }

  .interaction-probe h1,
  .interaction-probe h2,
  .interaction-probe h3,
  .interaction-probe p {
    margin: 0;
  }

  .interaction-probe h1,
  .interaction-probe h2,
  .interaction-probe h3 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-weight: var(--zdp-font-weight-medium);
  }

  .interaction-probe h1 {
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
  }

  .interaction-probe h2,
  .interaction-probe h3 {
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  @media (max-width: 640px) {
    .interaction-probe {
      padding: var(--zdp-space-4);
    }
  }
</style>
