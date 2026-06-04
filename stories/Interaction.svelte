<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import Dialog from '../src/lib/components/Dialog.svelte';
  import Divider from '../src/lib/components/Divider.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Kbd from '../src/lib/components/Kbd.svelte';
  import ShareDock from '../src/lib/components/ShareDock.svelte';
  import ShortcutHint from '../src/lib/components/ShortcutHint.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Tabs from '../src/lib/components/Tabs.svelte';
  import type { ZdpShareDockItem } from '../src/lib/share.ts';

  let lightDialogOpen = false;
  let darkDialogOpen = false;
  let lightShareCount = 0;
  let darkShareCount = 0;
  const shareItems: readonly ZdpShareDockItem[] = [
    { id: 'copy', label: '링크 복사', icon: 'copy', onclick: () => (lightShareCount += 1) },
    { id: 'device', label: '기기 공유', icon: 'device', onclick: () => (lightShareCount += 1) },
    { id: 'telegram', label: '텔레그램', icon: 'telegram', href: '#share', ariaLabel: '텔레그램으로 공유' },
    { id: 'line', label: '라인', icon: 'line', href: '#share', ariaLabel: '라인으로 공유' },
    { id: 'whatsapp', label: '왓츠앱', icon: 'whatsapp', href: '#share', ariaLabel: '왓츠앱으로 공유' },
    { id: 'x', label: 'X', icon: 'x', href: '#share', ariaLabel: 'X으로 공유' },
    { id: 'reddit', label: '레딧', icon: 'reddit', href: '#share', ariaLabel: '레딧으로 공유' }
  ];
  const darkShareItems: readonly ZdpShareDockItem[] = shareItems.map((item) =>
    item.id === 'copy' || item.id === 'device'
      ? { ...item, onclick: () => (darkShareCount += 1) }
      : item
  );
</script>

<main class="component-story zdp-surface-reset" id="interaction-main" lang="ko" tabindex="-1">
  <header class="component-story__header">
    <p>Interaction states</p>
    <h1>움직임보다 위치가 먼저 보이게</h1>
  </header>

  <div class="component-story__grid">
    <section class="component-story__panel" data-zdp-theme="light" aria-labelledby="interaction-light-title">
      <h2 id="interaction-light-title">Light</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <h3>Tabs</h3>
            <Tabs
              ariaLabel="Light interaction sections"
              items={[
                { id: 'overview', label: '개요' },
                { id: 'history', label: '기록' },
                { id: 'settings', label: '설정' },
                { id: 'archived', label: '보관됨', disabled: true }
              ]}
              selectedId="overview"
              let:selectedId
            >
              <strong>{selectedId === 'history' ? '기록' : selectedId === 'settings' ? '설정' : '개요'}</strong>
              <p>
                가까운 내용만 전환하고, 라우팅이나 권한 판단은 소비 화면에 남깁니다.
              </p>
            </Tabs>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Shortcut hints</h3>
            <p>
              검색과 이동처럼 반복되는 작업은 키캡으로 길을 보여주되, 실제 keydown 처리는 각 화면에 남깁니다.
            </p>
            <div class="shortcut-list" aria-label="Light shortcut hints">
              <div class="shortcut-row">
                <span>Search</span>
                <ShortcutHint keys={['/']} ariaLabel="Search shortcut slash" />
              </div>
              <div class="shortcut-row">
                <span>Command</span>
                <ShortcutHint keys={['Ctrl', 'K']} ariaLabel="Command shortcut Control K" />
              </div>
              <div class="shortcut-row">
                <span>Go to file</span>
                <Kbd label="T" ariaLabel="Go to file shortcut T" />
              </div>
              <div class="shortcut-row">
                <span>Save</span>
                <ShortcutHint keys={['Ctrl', 'S']} ariaLabel="Save shortcut Control S" />
              </div>
              <div class="shortcut-row">
                <span>Close</span>
                <Kbd label="Esc" ariaLabel="Close shortcut Escape" />
              </div>
            </div>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Dialog</h3>
            <p>확인이 필요한 순간에는 현재 흐름 위에 짧게 띄웁니다.</p>
            <Inline gap="md" align="center">
              <Button
                variant="primary"
                onclick={() => (lightDialogOpen = true)}
                ariaControls="interaction-light-dialog"
                ariaExpanded={lightDialogOpen}
              >
                검토 열기
              </Button>
              <span class="story-status">{lightDialogOpen ? '열림' : '닫힘'}</span>
            </Inline>
            <Dialog
              open={lightDialogOpen}
              id="interaction-light-dialog"
              labelledBy="interaction-light-dialog-title"
              describedBy="interaction-light-dialog-desc"
              onClose={() => (lightDialogOpen = false)}
            >
              <h2 slot="title" id="interaction-light-dialog-title">변경 내용을 저장할까요?</h2>
              <p id="interaction-light-dialog-desc">저장하면 다음 검토 화면에 바로 반영됩니다.</p>
              <svelte:fragment slot="footer">
                <Button variant="secondary" onclick={() => (lightDialogOpen = false)}>취소</Button>
                <Button variant="primary" onclick={() => (lightDialogOpen = false)}>저장</Button>
              </svelte:fragment>
            </Dialog>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>ShareDock</h3>
            <p>긴 라벨은 숨기고, 아이콘 focus와 툴팁으로 공유 경로를 보여줍니다.</p>
            <ShareDock placement="inline" ariaLabel="Light share actions" items={shareItems} />
            <span class="story-status">공유 준비 {lightShareCount}회</span>
          </Stack>
        </Surface>
      </Stack>
    </section>

    <section class="component-story__panel" data-zdp-theme="dark" aria-labelledby="interaction-dark-title">
      <h2 id="interaction-dark-title">Dark</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <h3>Tabs</h3>
            <Tabs
              ariaLabel="Dark interaction sections"
              items={[
                { id: 'overview', label: '개요' },
                { id: 'history', label: '기록' },
                { id: 'settings', label: '설정' },
                { id: 'archived', label: '보관됨', disabled: true }
              ]}
              selectedId="overview"
              let:selectedId
            >
              <strong>{selectedId === 'history' ? '기록' : selectedId === 'settings' ? '설정' : '개요'}</strong>
              <p>
                어두운 화면에서도 선택 상태와 focus 위치가 같은 규칙으로 움직입니다.
              </p>
            </Tabs>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Shortcut hints</h3>
            <p>
              어두운 화면에서도 키캡은 같은 테두리, 같은 focus 계열 안에서만 표시합니다.
            </p>
            <div class="shortcut-list" aria-label="Dark shortcut hints">
              <div class="shortcut-row">
                <span>Search</span>
                <ShortcutHint keys={['/']} ariaLabel="Search shortcut slash" />
              </div>
              <div class="shortcut-row">
                <span>Command</span>
                <ShortcutHint keys={['Ctrl', 'K']} ariaLabel="Command shortcut Control K" />
              </div>
              <div class="shortcut-row">
                <span>Go to file</span>
                <Kbd label="T" ariaLabel="Go to file shortcut T" />
              </div>
              <div class="shortcut-row">
                <span>Save</span>
                <ShortcutHint keys={['Ctrl', 'S']} ariaLabel="Save shortcut Control S" />
              </div>
              <div class="shortcut-row">
                <span>Close</span>
                <Kbd label="Esc" ariaLabel="Close shortcut Escape" />
              </div>
            </div>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Dialog</h3>
            <p>위험한 작업은 낮은 채도의 danger outline으로 확인합니다.</p>
            <Inline gap="md" align="center">
              <Button
                variant="danger"
                onclick={() => (darkDialogOpen = true)}
                ariaControls="interaction-dark-dialog"
                ariaExpanded={darkDialogOpen}
              >
                삭제 확인
              </Button>
              <span class="story-status">{darkDialogOpen ? '열림' : '닫힘'}</span>
            </Inline>
            <Dialog
              open={darkDialogOpen}
              id="interaction-dark-dialog"
              labelledBy="interaction-dark-dialog-title"
              describedBy="interaction-dark-dialog-desc"
              onClose={() => (darkDialogOpen = false)}
            >
              <h2 slot="title" id="interaction-dark-dialog-title">삭제 전에 확인하세요.</h2>
              <p id="interaction-dark-dialog-desc">삭제 후에는 이 화면에서 바로 되돌릴 수 없습니다.</p>
              <svelte:fragment slot="footer">
                <Button variant="secondary" onclick={() => (darkDialogOpen = false)}>취소</Button>
                <Button variant="danger" onclick={() => (darkDialogOpen = false)}>삭제</Button>
              </svelte:fragment>
            </Dialog>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>ShareDock</h3>
            <p>어두운 표면에서도 도크와 아이콘은 같은 framed control 규칙을 따릅니다.</p>
            <ShareDock placement="inline" ariaLabel="Dark share actions" items={darkShareItems} />
            <span class="story-status">공유 준비 {darkShareCount}회</span>
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

  .component-story__panel p {
    color: var(--zdp-color-ink-muted);
    line-height: var(--zdp-type-body-line-height);
    margin: 0;
  }

  .story-status {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }

  .shortcut-list {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .shortcut-row {
    align-items: center;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    display: flex;
    gap: var(--zdp-space-3);
    justify-content: space-between;
    min-width: 0;
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .shortcut-row span {
    color: var(--zdp-color-ink-strong);
    line-height: var(--zdp-type-body-line-height);
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
