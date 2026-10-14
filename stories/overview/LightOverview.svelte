<script lang="ts">
  import LoadingExamples from '../LoadingExamples.svelte';
  import Accordion from '../../src/lib/components/Accordion.svelte';
  import Avatar from '../../src/lib/components/Avatar.svelte';
  import Badge from '../../src/lib/components/Badge.svelte';
  import Breadcrumb from '../../src/lib/components/Breadcrumb.svelte';
  import Button from '../../src/lib/components/Button.svelte';
  import Callout from '../../src/lib/components/Callout.svelte';
  import Checkbox from '../../src/lib/components/Checkbox.svelte';
  import CodeBlock from '../../src/lib/components/CodeBlock.svelte';
  import CommandField from '../../src/lib/components/CommandField.svelte';
  import Dialog from '../../src/lib/components/Dialog.svelte';
  import Disclosure from '../../src/lib/components/Disclosure.svelte';
  import Divider from '../../src/lib/components/Divider.svelte';
  import EmptyState from '../../src/lib/components/EmptyState.svelte';
  import ErrorText from '../../src/lib/components/ErrorText.svelte';
  import Field from '../../src/lib/components/Field.svelte';
  import HelpText from '../../src/lib/components/HelpText.svelte';
  import Icon from '../../src/lib/components/Icon.svelte';
  import IconButton from '../../src/lib/components/IconButton.svelte';
  import Inline from '../../src/lib/components/Inline.svelte';
  import Input from '../../src/lib/components/Input.svelte';
  import IdentityChip from '../../src/lib/components/IdentityChip.svelte';
  import InlineCode from '../../src/lib/components/InlineCode.svelte';
  import KeyValue from '../../src/lib/components/KeyValue.svelte';
  import Label from '../../src/lib/components/Label.svelte';
  import Link from '../../src/lib/components/Link.svelte';
  import Pagination from '../../src/lib/components/Pagination.svelte';
  import Radio from '../../src/lib/components/Radio.svelte';
  import Select from '../../src/lib/components/Select.svelte';
  import SegmentedControl from '../../src/lib/components/SegmentedControl.svelte';
  import ShareDock from '../../src/lib/components/ShareDock.svelte';
  import SortHeader from '../../src/lib/components/SortHeader.svelte';
  import Stack from '../../src/lib/components/Stack.svelte';
  import StatusToast from '../../src/lib/components/StatusToast.svelte';
  import Surface from '../../src/lib/components/Surface.svelte';
  import Switch from '../../src/lib/components/Switch.svelte';
  import Tabs from '../../src/lib/components/Tabs.svelte';
  import Table from '../../src/lib/components/Table.svelte';
  import TableToolbar from '../../src/lib/components/TableToolbar.svelte';
  import Textarea from '../../src/lib/components/Textarea.svelte';
  import Toast from '../../src/lib/components/Toast.svelte';
  import VisuallyHidden from '../../src/lib/components/VisuallyHidden.svelte';

  import type { ZdpAccordionItem } from '../../src/lib/disclosure';
  import type { ZdpSegmentedControlItem } from '../../src/lib/segmented';
  import type { ZdpShareDockItem } from '../../src/lib/share';
  import type { ZdpStatusToastItem } from '../../src/lib/toast';
  export let lightDialogOpen = false;
  export let lightShareCount = 0;
  export let lightChoiceFrequency: string | null = 'weekly';
  export let shareItems: readonly ZdpShareDockItem[] = [];
  export let lightToastItems: readonly ZdpStatusToastItem[] = [];
  export let lightAccordionItems: readonly ZdpAccordionItem[] = [];
  export let lightSegmentedItems: readonly ZdpSegmentedControlItem[] = [];
  export let lightCodeExample = '';
</script>

<section class="theme-panel theme-panel--light" data-zdp-theme="light" aria-labelledby="storybook-light-title">
      <div class="theme-panel__header">
        <h2 id="storybook-light-title">Light</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section">
        <h3 id="storybook-light-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Warm brass</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Sage green</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Brass</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Terracotta</span>
          </span>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-type">Type</h3>
        <p class="type-sample">
          <strong>편안하게 읽고 분명하게 선택하기</strong>
          <span>Noto Sans KR-first multiscript text with warm contrast and enough air for product work.</span>
          <Link href="#foundation-tokens">자세히 보기</Link>
        </p>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-code">Code</h3>
        <Stack gap="sm">
          <p class="code-note">
            설정 값은 <InlineCode text="readonly" /> 상태로 남깁니다.
          </p>
          <CodeBlock
            label="릴리스 기준"
            language="ts"
            code={lightCodeExample}
            labelledBy="storybook-light-code"
          />
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-focus">Focus</h3>
        <div class="focus-demo">
          <Link href="#foundation-tokens">출시 노트 보기</Link>
          <CommandField
            id="storybook-light-focus-search"
            name="storybook-light-focus-search"
            label="검색"
            labelVisible
            placeholder="Search Design System"
            describedBy="storybook-light-command-help"
          />
          <p class="status-note" id="storybook-light-command-help">이 화면에서 찾을 항목을 입력하세요.</p>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-actions">Actions</h3>
        <Inline gap="sm" align="center">
          <Button variant="primary">저장</Button>
          <Button variant="secondary"><Icon size="sm">+</Icon><VisuallyHidden>새 항목 </VisuallyHidden>추가</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="solid">+</IconButton>
        </Inline>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-breadcrumb">Breadcrumb</h3>
        <Breadcrumb
          ariaLabel="밝은 화면 현재 위치"
          items={[
            { label: '홈 화면', href: '/' },
            { label: '플랫폼', href: '/platform' },
            { label: '디자인 시스템' }
          ]}
        />
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-feedback">Feedback</h3>
        <div class="feedback-stack">
          <Stack gap="md" align="start">
            <Inline gap="sm" align="center">
              <Badge tone="primary">검토 중</Badge>
              <Badge tone="success">정상</Badge>
              <Badge tone="warning">대기</Badge>
              <Badge tone="danger">주의</Badge>
            </Inline>
            <Callout tone="info" labelledBy="storybook-light-callout-info" semanticRole="note">
              <strong id="storybook-light-callout-info">다음 단계가 준비됐습니다.</strong>
              <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
            </Callout>
            <Divider />
            <Callout tone="danger" labelledBy="storybook-light-callout-danger" semanticRole="alert">
              <strong id="storybook-light-callout-danger">삭제 전에 다시 확인하세요.</strong>
              <p>되돌릴 수 없는 작업은 제품 저장소에서 별도 확인 흐름을 연결합니다.</p>
            </Callout>
            <Toast
              tone="success"
              labelledBy="storybook-light-toast-title"
              describedBy="storybook-light-toast-message"
            >
              <strong id="storybook-light-toast-title">초안이 준비됐습니다.</strong>
              <p id="storybook-light-toast-message">검토할 수 있는 상태로 바뀌었습니다.</p>
            </Toast>
            <StatusToast
              placement="inline"
              idPrefix="storybook-light-status-toast"
              items={lightToastItems}
            />
            <LoadingExamples idPrefix="storybook-light-progress" headingTag="strong" />
          </Stack>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-identity">Identity</h3>
        <Inline gap="sm" align="center">
          <Avatar label="홍길동" initials="홍" />
          <Avatar label="플랫폼 팀" initials="플" tone="primary" />
          <IdentityChip
            label="홍길동"
            description="검토 담당"
            initials="홍"
            href="#storybook-light-data"
            ariaCurrent="page"
          />
        </Inline>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-dialog">Dialog</h3>
        <div class="dialog-demo">
          <Button
            variant="secondary"
            onclick={() => (lightDialogOpen = true)}
            ariaControls="storybook-light-dialog-panel"
            ariaExpanded={lightDialogOpen}
          >검토 열기</Button>
          <p>중요한 확인은 같은 화면 위에서 짧고 분명하게 처리한다.</p>
        </div>
        <Dialog
          open={lightDialogOpen}
          id="storybook-light-dialog-panel"
          labelledBy="storybook-light-dialog-title"
          describedBy="storybook-light-dialog-desc"
          onClose={() => (lightDialogOpen = false)}
        >
          <h4 slot="title" id="storybook-light-dialog-title">변경 내용을 저장할까요?</h4>
          <p id="storybook-light-dialog-desc">저장하면 연결된 화면의 공개 표기가 함께 바뀝니다.</p>
          <div slot="footer" class="action-row">
            <Button variant="secondary" onclick={() => (lightDialogOpen = false)}>취소</Button>
            <Button variant="primary" onclick={() => (lightDialogOpen = false)}>저장</Button>
          </div>
        </Dialog>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-share">Share</h3>
        <Surface tone="panel" padding="lg">
          <Stack gap="sm">
            <strong>공유 경로</strong>
            <ShareDock placement="inline" ariaLabel="Light share actions" items={shareItems} />
            <p class="status-note">확인 {lightShareCount}회</p>
          </Stack>
        </Surface>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-tabs">Tabs</h3>
        <Tabs
          idPrefix="overview-light-tabs"
          ariaLabel="Light theme sections"
          items={[
            { id: 'overview', label: '개요' },
            { id: 'history', label: '기록' },
            { id: 'settings', label: '설정' }
          ]}
          selectedId="overview"
          let:selectedId={lightSelectedTabId}
        >
          <strong>{lightSelectedTabId === 'history' ? '기록' : lightSelectedTabId === 'settings' ? '설정' : '개요'}</strong>
          <p>탭은 페이지 안의 가까운 정보 묶음을 바꿀 때 사용합니다.</p>
        </Tabs>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-disclosure">Disclosure</h3>
        <Stack gap="md">
          <Disclosure id="storybook-light-disclosure-panel" title="검토 기준" open headingLevel={4}>
            <p>필요한 기준만 펼쳐서 확인합니다.</p>
          </Disclosure>
          <Accordion
            ariaLabel="밝은 화면 접힌 안내"
            items={lightAccordionItems}
            mode="multiple"
            headingLevel={4}
          />
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-segmented-control">Segmented Control</h3>
        <Stack gap="sm">
          <strong>보기 방식</strong>
          <SegmentedControl
            ariaLabel="밝은 화면 보기 방식"
            idPrefix="storybook-light-segmented"
            items={lightSegmentedItems}
            selectedId="list"
          />
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-data">Data</h3>
        <Stack gap="md">
          <TableToolbar
            title="점검 목록"
            summary="권한과 감사 항목을 확인합니다."
            selectedCount={2}
            density="compact"
            densityLabel="표 밀도"
            labelledBy="storybook-light-data"
          >
            <svelte:fragment slot="selection-actions">
              <Button variant="secondary">선택 해제</Button>
            </svelte:fragment>
            <svelte:fragment slot="actions">
              <Button>새로 고침</Button>
            </svelte:fragment>
          </TableToolbar>
          <Table caption="보안 점검 목록" density="compact">
            <thead>
              <tr>
                <th scope="col" aria-sort="ascending">
                  <SortHeader label="항목" direction="ascending" />
                </th>
                <th scope="col">
                  <SortHeader label="상태" direction="none" />
                </th>
                <th scope="col">다음 확인</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">권한 분리</th>
                <td>통과</td>
                <td>분기 리뷰</td>
              </tr>
              <tr>
                <th scope="row">감사 로그</th>
                <td>통과</td>
                <td>릴리스 전</td>
              </tr>
            </tbody>
          </Table>
          <Pagination
            currentPage={2}
            totalPages={8}
            ariaLabel="밝은 화면 점검 목록 페이지"
            hrefForPage={(page) => `#storybook-light-page-${page}`}
          />
          <KeyValue columns="two">
            <dt>소유 저장소</dt>
            <dd>zdp-money-platform</dd>
            <dt>승격 조건</dt>
            <dd>예산, 소유자, 운영 증거 확인</dd>
          </KeyValue>
          <EmptyState labelledBy="storybook-light-empty-title">
            <h4 id="storybook-light-empty-title">아직 공개할 변경이 없습니다.</h4>
            <p>검토가 끝난 항목만 공개 로드맵에 올라갑니다.</p>
          </EmptyState>
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-forms">Forms</h3>
        <div class="form-grid">
          <Field>
            <Label forId="storybook-light-name" required>이름</Label>
            <Input
              id="storybook-light-name"
              name="light-name"
              placeholder="홍길동"
              describedBy="storybook-light-name-help"
              required
            />
            <HelpText id="storybook-light-name-help">공개 표기와 알림에 사용됩니다.</HelpText>
          </Field>
          <Field>
            <Label forId="storybook-light-id">고정 ID</Label>
            <Input
              id="storybook-light-id"
              name="light-id"
              value="ZDP-2401"
              describedBy="storybook-light-id-help"
              readonly
            />
            <HelpText id="storybook-light-id-help">이미 발급된 값은 그대로 둡니다.</HelpText>
          </Field>
          <Field invalid>
            <Label forId="storybook-light-status">상태</Label>
            <Select
              id="storybook-light-status"
              name="light-status"
              value="blocked"
              describedBy="storybook-light-status-error"
              invalid
            >
              <option value="ready">준비됨</option>
              <option value="blocked">확인 필요</option>
            </Select>
            <ErrorText id="storybook-light-status-error">다음 단계 전에 기준을 확인하세요.</ErrorText>
          </Field>
          <Field>
            <Label forId="storybook-light-note">메모</Label>
            <Textarea
              id="storybook-light-note"
              name="light-note"
              placeholder="짧게 남기기"
              describedBy="storybook-light-note-help"
              rows={3}
            />
            <HelpText id="storybook-light-note-help">긴 문장은 줄바꿈으로 자연스럽게 이어집니다.</HelpText>
          </Field>
        </div>
        <div class="choice-grid">
          <Checkbox
            id="storybook-light-choice-updates"
            name="light-choice-updates"
            describedBy="storybook-light-choice-updates-help"
            checked
          >
            업데이트 받기
            <span
              slot="help"
              class="zdp-help-text"
              id="storybook-light-choice-updates-help"
            >중요한 변경만 보냅니다.</span>
          </Checkbox>
          <div class="choice-stack" role="radiogroup" aria-labelledby="storybook-light-choice-frequency">
            <span class="choice-group-label" id="storybook-light-choice-frequency">알림 주기</span>
            <Radio id="storybook-light-choice-weekly" name="light-choice-frequency" value="weekly" bind:selectedValue={lightChoiceFrequency}>
              매주
            </Radio>
            <Radio id="storybook-light-choice-monthly" name="light-choice-frequency" value="monthly" bind:selectedValue={lightChoiceFrequency}>
              매월
            </Radio>
          </div>
          <Switch
            id="storybook-light-choice-autosave"
            name="light-choice-autosave"
            describedBy="storybook-light-choice-autosave-help"
            checked
          >
            자동 저장
            <span
              slot="help"
              class="zdp-help-text"
              id="storybook-light-choice-autosave-help"
            >작성 중인 내용을 임시 보관합니다.</span>
          </Switch>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-light-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Ivory</span>
            <strong>작업을 펼치는 자리</strong>
            <p>밝은 종이감 위에 내용, 선택지, 다음 액션이 또렷하게 올라온다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Banner</span>
            <strong>살짝 들어 올린 강조</strong>
            <p>목록, 설정, 작은 알림이 과하게 튀지 않고 구분된다.</p>
          </Surface>
        </div>
      </section>
    </section>
