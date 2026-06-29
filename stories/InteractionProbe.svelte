<script lang="ts">
  import Accordion from '../src/lib/components/Accordion.svelte';
  import Button from '../src/lib/components/Button.svelte';
  import Combobox from '../src/lib/components/Combobox.svelte';
  import CommandField from '../src/lib/components/CommandField.svelte';
  import ConfirmAction from '../src/lib/components/ConfirmAction.svelte';
  import Disclosure from '../src/lib/components/Disclosure.svelte';
  import Dialog from '../src/lib/components/Dialog.svelte';
  import Menu from '../src/lib/components/Menu.svelte';
  import Popover from '../src/lib/components/Popover.svelte';
  import SegmentedControl from '../src/lib/components/SegmentedControl.svelte';
  import Sheet from '../src/lib/components/Sheet.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Tabs from '../src/lib/components/Tabs.svelte';
  import TermSheet from '../src/lib/components/TermSheet.svelte';
  import TermTrigger from '../src/lib/components/TermTrigger.svelte';
  import type { ZdpAccordionItem } from '../src/lib/disclosure.ts';
  import type { ZdpComboboxOption } from '../src/lib/combobox.ts';
  import type { ZdpMenuItem } from '../src/lib/menu.ts';
  import type { ZdpSegmentedControlItem } from '../src/lib/segmented.ts';
  import type { ZdpTermSheetTerm } from '../src/lib/term.ts';

  let selectedId = 'overview';
  let dialogOpen = false;
  let disclosureState = '닫힘';
  let accordionState = '선택 범위';
  let segmentedState = '목록';
  let commandQuery = '';
  let commandKeyState = '키 없음';
  let comboboxValue = '';
  let comboboxQuery = '';
  let comboboxState = '선택 없음';
  let menuSelection = '선택 없음';
  let popoverState = '닫힘';
  let sheetOpen = false;
  let termOpen = false;
  let confirmCount = 0;
  const menuItems: readonly ZdpMenuItem[] = [
    { id: 'settings', label: '설정 열기' },
    { id: 'filter', label: '필터 저장' },
    { id: 'archive', label: '보관함 이동', disabled: true }
  ];
  const accordionItems: readonly ZdpAccordionItem[] = [
    {
      id: 'interaction-probe-scope',
      title: '범위',
      content: '화면 흐름은 소비 앱에서 정합니다.',
      open: true
    },
    {
      id: 'interaction-probe-owner',
      title: '소유자',
      content: '권한과 데이터 판단은 제품 저장소가 연결합니다.'
    }
  ];
  const segmentedItems: readonly ZdpSegmentedControlItem[] = [
    { id: 'list', label: '목록' },
    { id: 'cards', label: '카드' },
    { id: 'summary', label: '요약' },
    { id: 'locked', label: '잠김', disabled: true }
  ];
  const comboboxOptions: readonly ZdpComboboxOption[] = [
    { id: 'project', label: '프로젝트', value: 'project', description: '작업 범위' },
    { id: 'settings', label: '설정', value: 'settings', description: '환경과 권한' },
    { id: 'locked', label: '잠김', value: 'locked', description: '선택할 수 없음', disabled: true }
  ];
  const termExample: ZdpTermSheetTerm = {
    id: 'operational-resilience',
    label: '운영 복원력',
    short: '장애가 나도 서비스가 완전히 멈추지 않게 버티고 회복하는 능력입니다.',
    long: '복구 절차, fallback, 관측 기준을 함께 갖춰야 합니다.',
    example: '읽기 화면은 유지하고 쓰기 작업만 잠시 막습니다.',
    relatedTerms: [{ id: 'fallback', label: 'fallback' }]
  };

  $: filteredComboboxOptions =
    comboboxQuery.trim().length === 0
      ? comboboxOptions
      : comboboxOptions.filter((option) => option.label.toLowerCase().includes(comboboxQuery.trim().toLowerCase()));
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

      <section aria-labelledby="interaction-probe-disclosure-title">
        <Stack gap="md">
          <h2 id="interaction-probe-disclosure-title">Accordion</h2>
          <Disclosure
            id="interaction-probe-disclosure"
            title="검토 기준"
            headingLevel={3}
            onOpenChange={(open) => (disclosureState = open ? '열림' : '닫힘')}
          >
            <p>필요한 기준만 펼쳐서 확인합니다.</p>
          </Disclosure>
          <p id="interaction-probe-disclosure-state">{disclosureState}</p>
          <Accordion
            ariaLabel="검토 안내"
            items={accordionItems}
            mode="single"
            headingLevel={3}
            onOpenChange={(item) => (accordionState = `선택 ${item.title}`)}
          />
          <p id="interaction-probe-accordion-state">{accordionState}</p>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-segmented-title">
        <Stack gap="md">
          <h2 id="interaction-probe-segmented-title">Segmented Control</h2>
          <SegmentedControl
            ariaLabel="보기 방식"
            idPrefix="interaction-probe-segmented"
            items={segmentedItems}
            selectedId="list"
            onChange={(_, item) => (segmentedState = item.label)}
          />
          <p id="interaction-probe-segmented-state">보기 {segmentedState}</p>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-command-title">
        <Stack gap="md">
          <h2 id="interaction-probe-command-title">Command Field</h2>
          <CommandField
            id="interaction-probe-command"
            name="interaction-probe-command"
            label="빠른 이동"
            labelVisible
            placeholder="문서와 설정 검색"
            value={commandQuery}
            describedBy={['interaction-probe-command-help', 'interaction-probe-command-state']}
            ariaKeyShortcuts="/"
            ariaAutocomplete="list"
            ariaControls={commandQuery ? 'interaction-probe-command-results' : null}
            ariaExpanded={commandQuery ? true : false}
            ariaActivedescendant={commandQuery ? 'interaction-probe-command-result-settings' : null}
            oninput={(event) => (commandQuery = (event.currentTarget as HTMLInputElement).value)}
            onkeydown={(event) => {
              if (event.key === 'Enter' || event.key === 'Escape') {
                commandKeyState = `키 ${event.key}`;
              }
            }}
          />
          <p id="interaction-probe-command-help">결과 표면과 이동 판단은 소비 화면이 연결합니다.</p>
          {#if commandQuery}
            <div id="interaction-probe-command-results" class="command-results" role="listbox" aria-label="빠른 이동 결과">
              <div id="interaction-probe-command-result-settings" role="option" aria-selected="true">
                설정
              </div>
            </div>
          {/if}
          <p id="interaction-probe-command-state">
            Command {commandQuery || '비어 있음'} · {commandKeyState}
          </p>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-combobox-title">
        <Stack gap="md">
          <h2 id="interaction-probe-combobox-title">Combobox</h2>
          <Combobox
            id="interaction-probe-combobox"
            name="interaction-probe-combobox"
            label="빠른 이동"
            labelVisible
            placeholder="항목 찾기"
            value={comboboxValue}
            query={comboboxQuery}
            options={filteredComboboxOptions}
            onQueryChange={(nextQuery) => (comboboxQuery = nextQuery)}
            onValueChange={(nextValue, option) => {
              comboboxValue = nextValue;
              comboboxQuery = option?.label ?? comboboxQuery;
              comboboxState = option?.label ?? '선택 없음';
            }}
          />
          <p id="interaction-probe-combobox-state">선택 {comboboxState}</p>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-menu-title">
        <Stack gap="md">
          <h2 id="interaction-probe-menu-title">Menu</h2>
          <Menu
            idPrefix="interaction-probe-menu"
            triggerLabel="더보기"
            items={menuItems}
            onSelect={(_, item) => (menuSelection = item.label)}
          >
            <svelte:fragment slot="trigger">더보기</svelte:fragment>
          </Menu>
          <p id="interaction-probe-menu-state">{menuSelection}</p>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-popover-title">
        <Stack gap="md">
          <h2 id="interaction-probe-popover-title">Popover</h2>
          <Popover
            idPrefix="interaction-probe-popover"
            placement="bottom"
            align="start"
            onOpenChange={(open) => (popoverState = open ? '열림' : '닫힘')}
            let:close
          >
            <svelte:fragment slot="trigger" let:open let:toggle let:panelId>
              <Button variant="secondary" onclick={toggle} ariaControls={panelId} ariaExpanded={open}>
                필터 열기
              </Button>
            </svelte:fragment>
            <Stack gap="sm">
              <strong>상태</strong>
              <Button variant="secondary" onclick={() => close()}>검토 중</Button>
              <Button variant="secondary" onclick={() => close()}>완료됨</Button>
            </Stack>
          </Popover>
          <Button variant="secondary">바깥 액션</Button>
          <p id="interaction-probe-popover-state">Popover {popoverState}</p>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-sheet-title">
        <Stack gap="md">
          <h2 id="interaction-probe-sheet-title">Sheet</h2>
          <Button
            variant="secondary"
            ariaControls="interaction-probe-sheet"
            ariaExpanded={sheetOpen}
            onclick={() => (sheetOpen = true)}
          >
            설정 열기
          </Button>
          <p id="interaction-probe-sheet-state">{sheetOpen ? 'Sheet 열림' : 'Sheet 닫힘'}</p>
          <Sheet
            open={sheetOpen}
            id="interaction-probe-sheet"
            labelledBy="interaction-probe-sheet-heading"
            describedBy="interaction-probe-sheet-desc"
            placement="right"
            onClose={() => (sheetOpen = false)}
          >
            <h3 slot="title" id="interaction-probe-sheet-heading">화면 설정</h3>
            <p id="interaction-probe-sheet-desc">표시 방식과 알림 범위를 확인합니다.</p>
            <svelte:fragment slot="footer">
              <Button variant="secondary" onclick={() => (sheetOpen = false)}>닫기</Button>
            </svelte:fragment>
          </Sheet>
        </Stack>
      </section>

      <section aria-labelledby="interaction-probe-term-title">
        <Stack gap="md">
          <h2 id="interaction-probe-term-title">Term Sheet</h2>
          <p>
            <TermTrigger
              termId={termExample.id}
              controls="interaction-probe-term-sheet"
              expanded={termOpen}
              onopen={() => (termOpen = true)}
            >
              운영 복원력
            </TermTrigger>
          </p>
          <p id="interaction-probe-term-state">{termOpen ? '용어 열림' : '용어 닫힘'}</p>
          <TermSheet
            open={termOpen}
            id="interaction-probe-term-sheet"
            term={termExample}
            placement="right"
            onClose={() => (termOpen = false)}
          />
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
    min-height: var(--zdp-viewport-block);
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

  .command-results {
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    color: var(--zdp-color-ink-normal);
    padding: var(--zdp-space-2);
  }

  @media (max-width: 640px) {
    .interaction-probe {
      padding: var(--zdp-space-4);
    }
  }
</style>
