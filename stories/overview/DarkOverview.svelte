<script lang="ts">
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
  import Progress from '../../src/lib/components/Progress.svelte';
  import Radio from '../../src/lib/components/Radio.svelte';
  import Select from '../../src/lib/components/Select.svelte';
  import SegmentedControl from '../../src/lib/components/SegmentedControl.svelte';
  import ShareDock from '../../src/lib/components/ShareDock.svelte';
  import Skeleton from '../../src/lib/components/Skeleton.svelte';
  import SortHeader from '../../src/lib/components/SortHeader.svelte';
  import Stack from '../../src/lib/components/Stack.svelte';
  import StatusToast from '../../src/lib/components/StatusToast.svelte';
  import Spinner from '../../src/lib/components/Spinner.svelte';
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
  export let darkDialogOpen = false;
  export let darkShareCount = 0;
  export let darkChoiceFrequency: string | null = 'weekly';
  export let darkShareItems: readonly ZdpShareDockItem[] = [];
  export let darkToastItems: readonly ZdpStatusToastItem[] = [];
  export let darkAccordionItems: readonly ZdpAccordionItem[] = [];
  export let darkSegmentedItems: readonly ZdpSegmentedControlItem[] = [];
  export let darkCodeExample = '';
</script>

<section class="theme-panel theme-panel--dark" data-zdp-theme="dark" aria-labelledby="storybook-dark-title">
      <div class="theme-panel__header">
        <h2 id="storybook-dark-title">Dark</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section">
        <h3 id="storybook-dark-color">Color</h3>
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
            <span class="swatch__label">Warm brass</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Terracotta</span>
          </span>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-type">Type</h3>
        <p class="type-sample">
          <strong>어두운 화면에서도 편안하게</strong>
          <span>Warm charcoal surfaces and ivory text keep the same visual hierarchy in dark mode.</span>
          <Link href="#foundation-tokens">자세히 보기</Link>
        </p>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-code">Code</h3>
        <Stack gap="sm">
          <p class="code-note">
            비밀값은 <InlineCode text="server-only" /> 경계에 둡니다.
          </p>
          <CodeBlock
            label="보안 경계"
            language="ts"
            code={darkCodeExample}
            tone="muted"
            wrap
            labelledBy="storybook-dark-code"
          />
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-focus">Focus</h3>
        <div class="focus-demo">
          <Link href="#foundation-tokens">업데이트 보기</Link>
          <CommandField
            id="storybook-dark-focus-search"
            name="storybook-dark-focus-search"
            label="검색"
            labelVisible
            placeholder="Search Design System"
            describedBy="storybook-dark-command-help"
          />
          <p class="status-note" id="storybook-dark-command-help">필요한 항목으로 바로 이동하세요.</p>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-actions">Actions</h3>
        <Inline gap="sm" align="center">
          <Button variant="primary">저장</Button>
          <Button variant="secondary"><Icon size="sm">+</Icon><VisuallyHidden>새 항목 </VisuallyHidden>추가</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="ghost">+</IconButton>
        </Inline>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-breadcrumb">Breadcrumb</h3>
        <Breadcrumb
          ariaLabel="어두운 화면 현재 위치"
          items={[
            { label: '홈 화면', href: '/' },
            { label: '플랫폼', href: '/platform' },
            { label: '디자인 시스템' }
          ]}
        />
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-feedback">Feedback</h3>
        <div class="feedback-stack">
          <Stack gap="md" align="start">
            <Inline gap="sm" align="center">
              <Badge tone="primary">검토 중</Badge>
              <Badge tone="success">정상</Badge>
              <Badge tone="warning">대기</Badge>
              <Badge tone="danger">주의</Badge>
            </Inline>
            <Callout tone="info" labelledBy="storybook-dark-callout-info" semanticRole="note">
              <strong id="storybook-dark-callout-info">작업 흐름이 준비됐습니다.</strong>
              <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
            </Callout>
            <Divider />
            <Callout tone="danger" labelledBy="storybook-dark-callout-danger" semanticRole="alert">
              <strong id="storybook-dark-callout-danger">위험 작업 전에 다시 확인하세요.</strong>
              <p>되돌릴 수 없는 작업은 제품 저장소에서 별도 확인 흐름을 연결합니다.</p>
            </Callout>
            <Toast
              tone="info"
              labelledBy="storybook-dark-toast-title"
              describedBy="storybook-dark-toast-message"
            >
              <strong id="storybook-dark-toast-title">작업이 저장됐습니다.</strong>
              <p id="storybook-dark-toast-message">다음 화면에서도 같은 상태를 볼 수 있습니다.</p>
            </Toast>
            <StatusToast
              placement="inline"
              idPrefix="storybook-dark-status-toast"
              items={darkToastItems}
            />
            <strong class="loading-title" id="storybook-dark-progress-title">진행</strong>
            <Progress
              tone="warning"
              labelledBy="storybook-dark-progress-title"
              describedBy="storybook-dark-progress-desc"
            />
            <p class="status-note" id="storybook-dark-progress-desc">응답을 기다리고 있습니다.</p>
            <Inline gap="sm" align="center">
              <Spinner size="md" tone="warning" label="응답 대기 중" />
              <span class="status-note">응답 대기 중</span>
            </Inline>
            <div class="loading-preview" role="group" aria-labelledby="storybook-dark-progress-title">
              <Skeleton variant="text" lines={2} />
              <Skeleton variant="avatar" />
            </div>
          </Stack>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-identity">Identity</h3>
        <Inline gap="sm" align="center">
          <Avatar label="김하늘" initials="김" />
          <Avatar label="운영 팀" initials="운" tone="primary" />
          <IdentityChip
            label="김하늘"
            description="운영 담당"
            initials="김"
            href="#storybook-dark-data"
            ariaCurrent="page"
          />
        </Inline>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-dialog">Dialog</h3>
        <div class="dialog-demo">
          <Button
            variant="secondary"
            onclick={() => (darkDialogOpen = true)}
            ariaControls="storybook-dark-dialog-panel"
            ariaExpanded={darkDialogOpen}
          >검토 열기</Button>
          <p>어두운 표면에서도 focus와 닫기 동작은 같은 규칙을 따른다.</p>
        </div>
        <Dialog
          open={darkDialogOpen}
          id="storybook-dark-dialog-panel"
          labelledBy="storybook-dark-dialog-title"
          describedBy="storybook-dark-dialog-desc"
          onClose={() => (darkDialogOpen = false)}
        >
          <h4 slot="title" id="storybook-dark-dialog-title">삭제 전에 확인하세요.</h4>
          <p id="storybook-dark-dialog-desc">이 작업은 제품 저장소의 별도 확인 흐름과 함께 사용합니다.</p>
          <div slot="footer" class="action-row">
            <Button variant="secondary" onclick={() => (darkDialogOpen = false)}>취소</Button>
            <Button variant="danger" onclick={() => (darkDialogOpen = false)}>삭제</Button>
          </div>
        </Dialog>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-share">Share</h3>
        <Surface tone="panel" padding="lg">
          <Stack gap="sm">
            <strong>공유 경로</strong>
            <ShareDock placement="inline" ariaLabel="Dark share actions" items={darkShareItems} />
            <p class="status-note">확인 {darkShareCount}회</p>
          </Stack>
        </Surface>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-tabs">Tabs</h3>
        <Tabs
          idPrefix="overview-dark-tabs"
          ariaLabel="Dark theme sections"
          items={[
            { id: 'overview', label: '개요' },
            { id: 'history', label: '기록' },
            { id: 'settings', label: '설정' }
          ]}
          selectedId="overview"
          let:selectedId={darkSelectedTabId}
        >
          <strong>{darkSelectedTabId === 'history' ? '기록' : darkSelectedTabId === 'settings' ? '설정' : '개요'}</strong>
          <p>탭은 페이지 안의 가까운 정보 묶음을 바꿀 때 사용합니다.</p>
        </Tabs>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-disclosure">Disclosure</h3>
        <Stack gap="md">
          <Disclosure id="storybook-dark-disclosure-panel" title="검토 기준" open headingLevel={4}>
            <p>긴 문장은 패널 안에서 줄바꿈으로 이어집니다.</p>
          </Disclosure>
          <Accordion
            ariaLabel="어두운 화면 접힌 안내"
            items={darkAccordionItems}
            mode="single"
            headingLevel={4}
          />
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-segmented-control">Segmented Control</h3>
        <Stack gap="sm">
          <strong>보기 방식</strong>
          <SegmentedControl
            ariaLabel="어두운 화면 보기 방식"
            idPrefix="storybook-dark-segmented"
            items={darkSegmentedItems}
            selectedId="summary"
          />
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-data">Data</h3>
        <Stack gap="md">
          <TableToolbar
            title="점검 목록"
            summary="대기 항목을 먼저 확인합니다."
            selectedCount={1}
            density="default"
            densityLabel="표 밀도"
            labelledBy="storybook-dark-data"
          >
            <svelte:fragment slot="selection-actions">
              <Button variant="secondary">보류</Button>
            </svelte:fragment>
            <svelte:fragment slot="actions">
              <Button>검토</Button>
            </svelte:fragment>
          </TableToolbar>
          <Table caption="보안 점검 목록" density="compact">
            <thead>
              <tr>
                <th scope="col">
                  <SortHeader label="항목" direction="none" />
                </th>
                <th scope="col" aria-sort="descending">
                  <SortHeader label="상태" direction="descending" />
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
                <th scope="row">비밀값 보관</th>
                <td>대기</td>
                <td>운영 전</td>
              </tr>
            </tbody>
          </Table>
          <Pagination
            currentPage={6}
            totalPages={14}
            ariaLabel="어두운 화면 점검 목록 페이지"
            hrefForPage={(page) => `#storybook-dark-page-${page}`}
          />
          <KeyValue columns="two">
            <dt>소유 저장소</dt>
            <dd>zdp-money-platform</dd>
            <dt>승격 조건</dt>
            <dd>예산, 소유자, 운영 증거 확인</dd>
          </KeyValue>
          <EmptyState tone="raised" align="center" labelledBy="storybook-dark-empty-title">
            <h4 id="storybook-dark-empty-title">대기 중인 알림이 없습니다.</h4>
            <p>위험 신호가 생기면 이 자리에 바로 표시됩니다.</p>
          </EmptyState>
        </Stack>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-forms">Forms</h3>
        <div class="form-grid">
          <Field>
            <Label forId="storybook-dark-name" required>이름</Label>
            <Input
              id="storybook-dark-name"
              name="dark-name"
              placeholder="홍길동"
              describedBy="storybook-dark-name-help"
              required
            />
            <HelpText id="storybook-dark-name-help">공개 표기와 알림에 사용됩니다.</HelpText>
          </Field>
          <Field>
            <Label forId="storybook-dark-id">고정 ID</Label>
            <Input
              id="storybook-dark-id"
              name="dark-id"
              value="ZDP-2401"
              describedBy="storybook-dark-id-help"
              readonly
            />
            <HelpText id="storybook-dark-id-help">이미 발급된 값은 그대로 둡니다.</HelpText>
          </Field>
          <Field invalid>
            <Label forId="storybook-dark-status">상태</Label>
            <Select
              id="storybook-dark-status"
              name="dark-status"
              value="blocked"
              describedBy="storybook-dark-status-error"
              invalid
            >
              <option value="ready">준비됨</option>
              <option value="blocked">확인 필요</option>
            </Select>
            <ErrorText id="storybook-dark-status-error">다음 단계 전에 기준을 확인하세요.</ErrorText>
          </Field>
          <Field>
            <Label forId="storybook-dark-note">메모</Label>
            <Textarea
              id="storybook-dark-note"
              name="dark-note"
              placeholder="짧게 남기기"
              describedBy="storybook-dark-note-help"
              rows={3}
            />
            <HelpText id="storybook-dark-note-help">긴 문장은 줄바꿈으로 자연스럽게 이어집니다.</HelpText>
          </Field>
        </div>
        <div class="choice-grid">
          <Checkbox
            id="storybook-dark-choice-updates"
            name="dark-choice-updates"
            describedBy="storybook-dark-choice-updates-help"
            checked
          >
            업데이트 받기
            <span
              slot="help"
              class="zdp-help-text"
              id="storybook-dark-choice-updates-help"
            >중요한 변경만 보냅니다.</span>
          </Checkbox>
          <div class="choice-stack" role="radiogroup" aria-labelledby="storybook-dark-choice-frequency">
            <span class="choice-group-label" id="storybook-dark-choice-frequency">알림 주기</span>
            <Radio id="storybook-dark-choice-weekly" name="dark-choice-frequency" value="weekly" bind:selectedValue={darkChoiceFrequency}>
              매주
            </Radio>
            <Radio id="storybook-dark-choice-monthly" name="dark-choice-frequency" value="monthly" bind:selectedValue={darkChoiceFrequency}>
              매월
            </Radio>
          </div>
          <Switch
            id="storybook-dark-choice-autosave"
            name="dark-choice-autosave"
            describedBy="storybook-dark-choice-autosave-help"
            checked
          >
            자동 저장
            <span
              slot="help"
              class="zdp-help-text"
              id="storybook-dark-choice-autosave-help"
            >작성 중인 내용을 임시 보관합니다.</span>
          </Switch>
        </div>
      </section>

      <section class="preview-section">
        <h3 id="storybook-dark-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Charcoal</span>
            <strong>어두운 배경의 작업지</strong>
            <p>톤은 낮추되 버튼과 상태 색은 같은 계열로 이어진다.</p>
          </Surface>
          <Surface tone="raised" padding="lg">
            <span class="surface-kicker">Banner</span>
            <strong>중요한 조각만 살짝 앞으로</strong>
            <p>짙은 잉크 위에서도 경계와 초점이 분명하다.</p>
          </Surface>
        </div>
      </section>
    </section>
