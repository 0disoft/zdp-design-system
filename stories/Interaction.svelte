<script lang="ts">
  import Accordion from '../src/lib/components/Accordion.svelte';
  import Button from '../src/lib/components/Button.svelte';
  import CommandField from '../src/lib/components/CommandField.svelte';
  import Disclosure from '../src/lib/components/Disclosure.svelte';
  import Dialog from '../src/lib/components/Dialog.svelte';
  import Divider from '../src/lib/components/Divider.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Kbd from '../src/lib/components/Kbd.svelte';
  import Menu from '../src/lib/components/Menu.svelte';
  import Popover from '../src/lib/components/Popover.svelte';
  import SegmentedControl from '../src/lib/components/SegmentedControl.svelte';
  import ShareDock from '../src/lib/components/ShareDock.svelte';
  import ShortcutHint from '../src/lib/components/ShortcutHint.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Tabs from '../src/lib/components/Tabs.svelte';
  import TermSheet from '../src/lib/components/TermSheet.svelte';
  import TermTrigger from '../src/lib/components/TermTrigger.svelte';
  import ThemeToggle from '../src/lib/components/ThemeToggle.svelte';
  import Tooltip from '../src/lib/components/Tooltip.svelte';
  import type { ZdpAccordionItem } from '../src/lib/disclosure.ts';
  import type { ZdpMenuItem } from '../src/lib/menu.ts';
  import type { ZdpSegmentedControlItem } from '../src/lib/segmented.ts';
  import type { ZdpShareDockItem } from '../src/lib/share.ts';
  import {
    zdpShortcutRecommendations,
    zdpShortcutReservedExamples,
    type ZdpShortcutIntent
  } from '../src/lib/shortcuts.ts';
  import type { ZdpTermSheetTerm } from '../src/lib/term.ts';
  import type { ZdpThemeMode } from '../src/lib/theme.ts';

  let lightDialogOpen = false;
  let darkDialogOpen = false;
  let lightShareCount = 0;
  let darkShareCount = 0;
  let lightCommandQuery = '';
  let darkCommandQuery = '';
  let lightMenuSelection = '선택 없음';
  let darkMenuSelection = '선택 없음';
  let lightSegmentedSelection = '목록';
  let darkSegmentedSelection = '요약';
  let lightTermOpen = false;
  let darkTermOpen = false;
  let lightTheme: ZdpThemeMode = 'light';
  let darkTheme: ZdpThemeMode = 'dark';
  const visibleShortcutIntents: readonly ZdpShortcutIntent[] = [
    'search',
    'help',
    'escape',
    'open',
    'previous',
    'next',
    'submit'
  ];
  const visibleShortcutRecommendations = zdpShortcutRecommendations.filter((shortcut) =>
    visibleShortcutIntents.includes(shortcut.intent)
  );
  const reservedShortcutPreview = zdpShortcutReservedExamples.slice(0, 6);
  const menuItems: readonly ZdpMenuItem[] = [
    { id: 'settings', label: '설정 열기' },
    { id: 'filter', label: '필터 저장' },
    { id: 'account', label: '계정 보기' },
    { id: 'archive', label: '보관함 이동', disabled: true },
    { id: 'disconnect', label: '연결 끊기', tone: 'danger', separatorBefore: true }
  ];
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
  const lightAccordionItems: readonly ZdpAccordionItem[] = [
    {
      id: 'interaction-light-scope',
      title: '범위',
      content: '화면 흐름과 데이터 판단은 각 소비 앱에서 정합니다.',
      open: true
    },
    {
      id: 'interaction-light-owner',
      title: '소유자',
      content: '표시할 항목과 권한 판단은 제품 저장소가 연결합니다.'
    },
    {
      id: 'interaction-light-disabled',
      title: '보류',
      content: '아직 열 수 없는 항목입니다.',
      disabled: true
    }
  ];
  const darkAccordionItems: readonly ZdpAccordionItem[] = [
    {
      id: 'interaction-dark-scope',
      title: '검토',
      content: '긴 안내는 같은 자리에서 접고 펼칩니다.',
      open: true
    },
    {
      id: 'interaction-dark-owner',
      title: '연결',
      content: '저장, 권한, 데이터 fetch는 소비 화면의 상태와 함께 움직입니다.'
    }
  ];
  const lightSegmentedItems: readonly ZdpSegmentedControlItem[] = [
    { id: 'list', label: '목록' },
    { id: 'cards', label: '카드' },
    { id: 'summary', label: '요약' },
    { id: 'locked', label: '잠김', disabled: true }
  ];
  const darkSegmentedItems: readonly ZdpSegmentedControlItem[] = [
    { id: 'summary', label: '요약' },
    { id: 'history', label: '기록' },
    { id: 'settings', label: '설정' }
  ];
  const termExample: ZdpTermSheetTerm = {
    id: 'operational-resilience',
    label: '운영 복원력',
    short: '장애가 나도 서비스가 완전히 멈추지 않게 버티고 회복하는 능력입니다.',
    long: '정책, 배포, 관측, 복구 흐름이 함께 맞아야 유지됩니다.',
    example: '결제 화면은 읽기 전용 상태로 낮추고, 원장 기록은 재시도 큐로 이어갑니다.',
    relatedTerms: [
      { id: 'fallback', label: 'fallback' },
      { id: 'runbook', label: 'runbook' }
    ],
    canonicalPath: '#term-operational-resilience'
  };

  function shortcutIntentLabel(intent: ZdpShortcutIntent): string {
    switch (intent) {
      case 'search':
        return 'Search';
      case 'help':
        return 'Guide';
      case 'escape':
        return 'Close';
      case 'open':
        return 'Open';
      case 'submit':
        return 'Submit';
      case 'previous':
        return 'Previous';
      case 'next':
        return 'Next';
      case 'create':
        return 'Create';
      case 'edit':
        return 'Edit';
      case 'filter':
        return 'Filter';
      case 'goHome':
        return 'Go home';
      case 'goSettings':
        return 'Go settings';
    }
  }
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
              idPrefix="interaction-light-tabs"
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
            <h3>Command Field</h3>
            <p>검색창은 입력과 focus만 맡고, 결과와 이동은 각 화면이 연결합니다.</p>
            <CommandField
              id="interaction-light-command"
              name="interaction-light-command"
              label="빠른 이동"
              labelVisible
              placeholder="프로젝트, 문서, 설정 검색"
              describedBy="interaction-light-command-help"
              oninput={(event) => (lightCommandQuery = (event.currentTarget as HTMLInputElement).value)}
            />
            <span class="story-status" id="interaction-light-command-help">
              {lightCommandQuery || '검색어 없음'}
            </span>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Shortcut hints</h3>
            <p>
              자주 쓰고 되돌릴 수 있는 키만 드러내고, 실제 keydown 처리는 각 화면에 남깁니다.
            </p>
            <div class="shortcut-list" role="group" aria-label="Light shortcut hints">
              {#each visibleShortcutRecommendations as shortcut}
                <div class="shortcut-row">
                  <span>{shortcutIntentLabel(shortcut.intent)}</span>
                  <ShortcutHint keys={shortcut.keys} ariaLabel={`${shortcutIntentLabel(shortcut.intent)} shortcut`} />
                </div>
              {/each}
            </div>
            <div class="shortcut-policy" aria-label="Light shortcut guard examples">
              <span>Typing</span>
              <Kbd label="off" ariaLabel="Global shortcuts off while typing" />
              <span>IME</span>
              <Kbd label="off" ariaLabel="Global shortcuts off during IME composition" />
              <span>Reserved</span>
              <span class="shortcut-reserved">{reservedShortcutPreview.join(', ')}</span>
            </div>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Theme Toggle</h3>
            <p>현재 표면의 light/dark 상태만 보여주고, 저장과 초기값은 소비 화면이 정합니다.</p>
            <Inline gap="sm" align="center">
              <ThemeToggle
                theme={lightTheme}
                onclick={() => (lightTheme = lightTheme === 'dark' ? 'light' : 'dark')}
              />
              <span class="story-status">{lightTheme === 'dark' ? '다크' : '라이트'}</span>
            </Inline>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Tooltip</h3>
            <p>아이콘만 보이는 버튼에는 짧은 도움말을 붙여 현재 액션을 바로 확인합니다.</p>
            <Inline gap="sm" align="center">
              <Tooltip text="새 항목" placement="top">
                <Button variant="secondary">
                  <span aria-hidden="true">+</span>
                  <span class="zdp-visually-hidden">새 항목</span>
                </Button>
              </Tooltip>
              <Tooltip text="닫기" placement="right" id="interaction-light-tooltip-close" let:describedBy>
                <Button variant="secondary" ariaLabel="닫기" ariaDescribedBy={describedBy}>
                  <span aria-hidden="true">Esc</span>
                </Button>
              </Tooltip>
            </Inline>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Term Sheet</h3>
            <p>
              본문 안
              <TermTrigger
                termId={termExample.id}
                controls="interaction-light-term-sheet"
                expanded={lightTermOpen}
                onopen={() => (lightTermOpen = true)}
              >
                운영 복원력
              </TermTrigger>
              을 클릭하면 긴 설명은 sheet로 넘기고, manifest와 locale 판단은 소비 화면에 남깁니다.
            </p>
            <span class="story-status">{lightTermOpen ? '용어 열림' : '용어 닫힘'}</span>
            <TermSheet
              open={lightTermOpen}
              id="interaction-light-term-sheet"
              term={termExample}
              placement="right"
              onClose={() => (lightTermOpen = false)}
            />
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Accordion and Disclosure</h3>
            <p>접힌 안내는 현재 자리에서 열고, 다음 판단은 각 화면에 남깁니다.</p>
            <Disclosure id="interaction-light-disclosure" title="검토 기준" open headingLevel={4}>
              <p>필요한 기준만 펼쳐서 확인합니다.</p>
            </Disclosure>
            <Accordion
              ariaLabel="Light disclosure sections"
              items={lightAccordionItems}
              mode="multiple"
              headingLevel={4}
            />
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Segmented Control</h3>
            <p>보기 방식처럼 가까운 선택지만 바꾸고, 실제 목록 상태는 각 화면에 남깁니다.</p>
            <Inline gap="sm" align="center">
              <SegmentedControl
                ariaLabel="Light view mode"
                idPrefix="interaction-light-segmented"
                items={lightSegmentedItems}
                selectedId="list"
                onChange={(_, item) => (lightSegmentedSelection = item.label)}
              />
              <span class="story-status">{lightSegmentedSelection}</span>
            </Inline>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Popover and Menu</h3>
            <p>필터와 더보기는 같은 자리에서 짧게 펼치고, 선택한 뒤에는 원래 흐름으로 돌아옵니다.</p>
            <Inline gap="sm" align="center">
              <Popover idPrefix="interaction-light-popover" placement="bottom" align="start" let:close>
                <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
                  <Button variant="secondary" onclick={toggle} ariaControls={panelId} ariaExpanded={open}>
                    필터
                  </Button>
                </svelte:fragment>
                <Stack gap="sm">
                  <strong>상태</strong>
                  <Button variant="secondary" onclick={() => close()}>검토 중</Button>
                  <Button variant="secondary" onclick={() => close()}>완료됨</Button>
                </Stack>
              </Popover>
              <Menu
                idPrefix="interaction-light-menu"
                triggerLabel="더보기"
                items={menuItems}
                onSelect={(_, item) => (lightMenuSelection = item.label)}
              >
                <svelte:fragment slot="trigger">더보기</svelte:fragment>
              </Menu>
              <span class="story-status">{lightMenuSelection}</span>
            </Inline>
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
              idPrefix="interaction-dark-tabs"
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
            <h3>Command Field</h3>
            <p>어두운 표면에서도 검색 frame과 keycap은 같은 선 안에서 보입니다.</p>
            <CommandField
              id="interaction-dark-command"
              name="interaction-dark-command"
              label="빠른 이동"
              labelVisible
              placeholder="프로젝트, 문서, 설정 검색"
              describedBy="interaction-dark-command-help"
              oninput={(event) => (darkCommandQuery = (event.currentTarget as HTMLInputElement).value)}
            />
            <span class="story-status" id="interaction-dark-command-help">
              {darkCommandQuery || '검색어 없음'}
            </span>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Shortcut hints</h3>
            <p>
              어두운 표면에서도 같은 키캡 밀도와 입력 보호 규칙을 유지합니다.
            </p>
            <div class="shortcut-list" role="group" aria-label="Dark shortcut hints">
              {#each visibleShortcutRecommendations as shortcut}
                <div class="shortcut-row">
                  <span>{shortcutIntentLabel(shortcut.intent)}</span>
                  <ShortcutHint keys={shortcut.keys} ariaLabel={`${shortcutIntentLabel(shortcut.intent)} shortcut`} />
                </div>
              {/each}
            </div>
            <div class="shortcut-policy" aria-label="Dark shortcut guard examples">
              <span>Typing</span>
              <Kbd label="off" ariaLabel="Global shortcuts off while typing" />
              <span>IME</span>
              <Kbd label="off" ariaLabel="Global shortcuts off during IME composition" />
              <span>Reserved</span>
              <span class="shortcut-reserved">{reservedShortcutPreview.join(', ')}</span>
            </div>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Theme Toggle</h3>
            <p>어두운 표면에서도 토글은 같은 focus와 pressed 상태를 씁니다.</p>
            <Inline gap="sm" align="center">
              <ThemeToggle
                theme={darkTheme}
                onclick={() => (darkTheme = darkTheme === 'dark' ? 'light' : 'dark')}
              />
              <span class="story-status">{darkTheme === 'dark' ? '다크' : '라이트'}</span>
            </Inline>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Tooltip</h3>
            <p>어두운 표면에서도 tooltip은 같은 ink surface와 1px border로 표시합니다.</p>
            <Inline gap="sm" align="center">
              <Tooltip text="새 항목" placement="top">
                <Button variant="secondary">
                  <span aria-hidden="true">+</span>
                  <span class="zdp-visually-hidden">새 항목</span>
                </Button>
              </Tooltip>
              <Tooltip text="닫기" placement="right" id="interaction-dark-tooltip-close" let:describedBy>
                <Button variant="secondary" ariaLabel="닫기" ariaDescribedBy={describedBy}>
                  <span aria-hidden="true">Esc</span>
                </Button>
              </Tooltip>
            </Inline>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Term Sheet</h3>
            <p>
              어두운 표면의
              <TermTrigger
                termId={termExample.id}
                controls="interaction-dark-term-sheet"
                expanded={darkTermOpen}
                onopen={() => (darkTermOpen = true)}
              >
                운영 복원력
              </TermTrigger>
              도 같은 click-open 계약을 씁니다.
            </p>
            <span class="story-status">{darkTermOpen ? '용어 열림' : '용어 닫힘'}</span>
            <TermSheet
              open={darkTermOpen}
              id="interaction-dark-term-sheet"
              term={termExample}
              placement="bottom"
              onClose={() => (darkTermOpen = false)}
            />
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Accordion and Disclosure</h3>
            <p>어두운 표면에서도 열린 상태와 focus 위치가 같은 선으로 드러납니다.</p>
            <Disclosure id="interaction-dark-disclosure" title="검토 기준" open headingLevel={4}>
              <p>긴 문장은 패널 안에서 줄바꿈으로 이어집니다.</p>
            </Disclosure>
            <Accordion
              ariaLabel="Dark disclosure sections"
              items={darkAccordionItems}
              mode="single"
              headingLevel={4}
            />
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Segmented Control</h3>
            <p>어두운 표면에서도 선택된 항목과 focus 위치가 같은 framed control로 보입니다.</p>
            <Inline gap="sm" align="center">
              <SegmentedControl
                ariaLabel="Dark view mode"
                idPrefix="interaction-dark-segmented"
                items={darkSegmentedItems}
                selectedId="summary"
                onChange={(_, item) => (darkSegmentedSelection = item.label)}
              />
              <span class="story-status">{darkSegmentedSelection}</span>
            </Inline>
          </Stack>
        </Surface>

        <Divider />

        <Surface padding="lg">
          <Stack gap="md">
            <h3>Popover and Menu</h3>
            <p>어두운 표면에서도 열림, 선택, 비활성 상태가 같은 선과 색으로 또렷하게 보입니다.</p>
            <Inline gap="sm" align="center">
              <Popover idPrefix="interaction-dark-popover" placement="bottom" align="start" let:close>
                <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
                  <Button variant="secondary" onclick={toggle} ariaControls={panelId} ariaExpanded={open}>
                    필터
                  </Button>
                </svelte:fragment>
                <Stack gap="sm">
                  <strong>상태</strong>
                  <Button variant="secondary" onclick={() => close()}>대기</Button>
                  <Button variant="secondary" onclick={() => close()}>완료됨</Button>
                </Stack>
              </Popover>
              <Menu
                idPrefix="interaction-dark-menu"
                triggerLabel="더보기"
                items={menuItems}
                onSelect={(_, item) => (darkMenuSelection = item.label)}
              >
                <svelte:fragment slot="trigger">더보기</svelte:fragment>
              </Menu>
              <span class="story-status">{darkMenuSelection}</span>
            </Inline>
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

  .shortcut-policy {
    align-items: center;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    min-width: 0;
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .shortcut-policy > span {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }

  .shortcut-policy .shortcut-reserved {
    flex: 1 1 12rem;
    min-width: 0;
    overflow-wrap: anywhere;
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
