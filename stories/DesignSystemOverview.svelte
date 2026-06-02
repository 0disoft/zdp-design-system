<script lang="ts">
  import Badge from '../src/lib/components/Badge.svelte';
  import Breadcrumb from '../src/lib/components/Breadcrumb.svelte';
  import Button from '../src/lib/components/Button.svelte';
  import Callout from '../src/lib/components/Callout.svelte';
  import Checkbox from '../src/lib/components/Checkbox.svelte';
  import Dialog from '../src/lib/components/Dialog.svelte';
  import Divider from '../src/lib/components/Divider.svelte';
  import ErrorText from '../src/lib/components/ErrorText.svelte';
  import Field from '../src/lib/components/Field.svelte';
  import HelpText from '../src/lib/components/HelpText.svelte';
  import IconButton from '../src/lib/components/IconButton.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Input from '../src/lib/components/Input.svelte';
  import Label from '../src/lib/components/Label.svelte';
  import Link from '../src/lib/components/Link.svelte';
  import Radio from '../src/lib/components/Radio.svelte';
  import Select from '../src/lib/components/Select.svelte';
  import SkipLink from '../src/lib/components/SkipLink.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Switch from '../src/lib/components/Switch.svelte';
  import Tabs from '../src/lib/components/Tabs.svelte';
  import Textarea from '../src/lib/components/Textarea.svelte';
  import VisuallyHidden from '../src/lib/components/VisuallyHidden.svelte';

  let lightDialogOpen = false;
  let darkDialogOpen = false;
</script>

<SkipLink href="#foundation-tokens">본문으로 건너뛰기</SkipLink>

<main class="storybook-preview zdp-surface-reset" lang="ko">
  <header class="storybook-preview__header">
    <div>
      <p class="eyebrow">Sunlit parchment kit</p>
      <h1>ZDP Design System</h1>
      <p>Bright town-square surfaces, soft heraldic color, and quiet working controls.</p>
    </div>
    <span>Storybook</span>
  </header>

  <div class="storybook-preview__grid" aria-label="Theme previews">
    <section class="theme-panel theme-panel--light" data-zdp-theme="light" aria-labelledby="storybook-light-title">
      <div class="theme-panel__header">
        <h2 id="storybook-light-title">Light</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section" aria-labelledby="storybook-light-color">
        <h3 id="storybook-light-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Dusty blue</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Sage green</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Sunlit gold</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Burgundy</span>
          </span>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-type">
        <h3 id="storybook-light-type">Type</h3>
        <p class="type-sample">
          <strong>마을 광장처럼 밝고 단단하게</strong>
          <span>Pretendard-first multiscript text with warm contrast and enough air for product work.</span>
          <Link href="#foundation-tokens">자세히 보기</Link>
        </p>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-focus">
        <h3 id="storybook-light-focus">Focus</h3>
        <div class="focus-demo">
          <Link href="#foundation-tokens">출시 노트 보기</Link>
          <label class="focus-demo__field" for="storybook-light-focus-search">
            <span>검색</span>
            <input id="storybook-light-focus-search" type="search" placeholder="Search Design System" />
          </label>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-actions">
        <h3 id="storybook-light-actions">Actions</h3>
        <Inline gap="sm" align="center">
          <Button variant="primary">저장</Button>
          <Button variant="secondary"><VisuallyHidden>작업 </VisuallyHidden>취소</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="solid">+</IconButton>
        </Inline>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-breadcrumb">
        <h3 id="storybook-light-breadcrumb">Breadcrumb</h3>
        <Breadcrumb
          ariaLabel="현재 위치"
          items={[
            { label: '홈', href: '/' },
            { label: '플랫폼', href: '/platform' },
            { label: '디자인 시스템' }
          ]}
        />
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-feedback">
        <h3 id="storybook-light-feedback">Feedback</h3>
        <div class="feedback-stack">
          <Stack gap="md" align="start">
            <Inline as="section" gap="sm" align="center" labelledBy="storybook-light-feedback">
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
          </Stack>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-light-dialog">
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

      <section class="preview-section" aria-labelledby="storybook-light-tabs">
        <h3 id="storybook-light-tabs">Tabs</h3>
        <Tabs
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

      <section class="preview-section" aria-labelledby="storybook-light-forms">
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
            <Radio id="storybook-light-choice-weekly" name="light-choice-frequency" value="weekly" checked>
              매주
            </Radio>
            <Radio id="storybook-light-choice-monthly" name="light-choice-frequency" value="monthly">
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

      <section class="preview-section" aria-labelledby="storybook-light-surfaces">
        <h3 id="storybook-light-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Parchment</span>
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

    <section class="theme-panel theme-panel--dark" data-zdp-theme="dark" aria-labelledby="storybook-dark-title">
      <div class="theme-panel__header">
        <h2 id="storybook-dark-title">Dark</h2>
        <span>OKLCH</span>
      </div>

      <section class="preview-section" aria-labelledby="storybook-dark-color">
        <h3 id="storybook-dark-color">Color</h3>
        <div class="swatches">
          <span class="swatch">
            <span class="swatch__paint swatch__paint--primary"></span>
            <span class="swatch__label">Moonlit blue</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--success"></span>
            <span class="swatch__label">Sage green</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--warning"></span>
            <span class="swatch__label">Lantern gold</span>
          </span>
          <span class="swatch">
            <span class="swatch__paint swatch__paint--danger"></span>
            <span class="swatch__label">Terracotta</span>
          </span>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-type">
        <h3 id="storybook-dark-type">Type</h3>
        <p class="type-sample">
          <strong>밤에도 종이결은 남기기</strong>
          <span>Dark mode keeps the same market palette without turning into a blue console.</span>
          <Link href="#foundation-tokens">자세히 보기</Link>
        </p>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-focus">
        <h3 id="storybook-dark-focus">Focus</h3>
        <div class="focus-demo">
          <Link href="#foundation-tokens">업데이트 보기</Link>
          <label class="focus-demo__field" for="storybook-dark-focus-search">
            <span>검색</span>
            <input id="storybook-dark-focus-search" type="search" placeholder="Search Design System" />
          </label>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-actions">
        <h3 id="storybook-dark-actions">Actions</h3>
        <Inline gap="sm" align="center">
          <Button variant="primary">저장</Button>
          <Button variant="secondary"><VisuallyHidden>작업 </VisuallyHidden>취소</Button>
          <Button variant="danger">삭제</Button>
          <IconButton ariaLabel="추가" variant="ghost">+</IconButton>
        </Inline>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-breadcrumb">
        <h3 id="storybook-dark-breadcrumb">Breadcrumb</h3>
        <Breadcrumb
          ariaLabel="현재 위치"
          items={[
            { label: '홈', href: '/' },
            { label: '플랫폼', href: '/platform' },
            { label: '디자인 시스템' }
          ]}
        />
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-feedback">
        <h3 id="storybook-dark-feedback">Feedback</h3>
        <div class="feedback-stack">
          <Stack gap="md" align="start">
            <Inline as="section" gap="sm" align="center" labelledBy="storybook-dark-feedback">
              <Badge tone="primary">검토 중</Badge>
              <Badge tone="success">정상</Badge>
              <Badge tone="warning">대기</Badge>
              <Badge tone="danger">주의</Badge>
            </Inline>
            <Callout tone="info" labelledBy="storybook-dark-callout-info" semanticRole="note">
              <strong id="storybook-dark-callout-info">다음 단계가 준비됐습니다.</strong>
              <p>필요한 입력을 확인한 뒤 저장하면 변경 내역에 남습니다.</p>
            </Callout>
            <Divider />
            <Callout tone="danger" labelledBy="storybook-dark-callout-danger" semanticRole="alert">
              <strong id="storybook-dark-callout-danger">삭제 전에 다시 확인하세요.</strong>
              <p>되돌릴 수 없는 작업은 제품 저장소에서 별도 확인 흐름을 연결합니다.</p>
            </Callout>
          </Stack>
        </div>
      </section>

      <section class="preview-section" aria-labelledby="storybook-dark-dialog">
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

      <section class="preview-section" aria-labelledby="storybook-dark-tabs">
        <h3 id="storybook-dark-tabs">Tabs</h3>
        <Tabs
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

      <section class="preview-section" aria-labelledby="storybook-dark-forms">
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
            <Radio id="storybook-dark-choice-weekly" name="dark-choice-frequency" value="weekly" checked>
              매주
            </Radio>
            <Radio id="storybook-dark-choice-monthly" name="dark-choice-frequency" value="monthly">
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

      <section class="preview-section" aria-labelledby="storybook-dark-surfaces">
        <h3 id="storybook-dark-surfaces">Surfaces</h3>
        <div class="surface-grid">
          <Surface tone="panel" padding="lg">
            <span class="surface-kicker">Parchment</span>
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
  </div>

  <section class="foundation-strip" id="foundation-tokens" aria-label="Foundation tokens">
    <article>
      <span>Type</span>
      <strong>Body / small / caption / data</strong>
    </article>
    <article>
      <span>Control</span>
      <strong>2.25rem / 2.75rem</strong>
    </article>
    <article>
      <span>Responsive</span>
      <strong>40 / 64 / 80 / 96rem</strong>
    </article>
    <article>
      <span>i18n</span>
      <strong><span lang="ko">긴문장</span> / <span lang="zh">自由</span> / <span lang="hi">स्वर</span> / Safe</strong>
    </article>
  </section>

  <section class="motif-strip" aria-label="Decorative motif samples">
    <span class="motif-strip__line"></span>
    <span class="motif-strip__mark">✦</span>
    <span class="motif-strip__line"></span>
  </section>
</main>

<style>
  .storybook-preview {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-8);
    min-height: 100vh;
    padding: var(--zdp-space-8);
  }

  .storybook-preview__header {
    align-items: end;
    display: flex;
    gap: var(--zdp-space-4);
    justify-content: space-between;
  }

  .eyebrow {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-bold);
    letter-spacing: 0;
    margin: 0 0 var(--zdp-space-2);
    text-transform: uppercase;
  }

  .storybook-preview__header h1 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: 3.5rem;
    font-weight: var(--zdp-font-weight-bold);
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
  }

  .storybook-preview__header p:not(.eyebrow) {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-md);
    margin: var(--zdp-space-3) 0 0;
    max-width: 34rem;
  }

  .storybook-preview__header > span,
  .theme-panel__header span {
    background: var(--zdp-color-surface-raised);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-semibold);
    padding: var(--zdp-space-1) var(--zdp-space-3);
  }

  .storybook-preview__grid {
    display: grid;
    gap: var(--zdp-space-6);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .theme-panel {
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-6);
    min-width: 0;
    padding: var(--zdp-space-6);
  }

  .theme-panel--light {
    border-color: var(--zdp-color-line-strong);
  }

  .theme-panel--dark {
    background: var(--zdp-color-surface-panel);
  }

  .theme-panel__header {
    align-items: center;
    display: flex;
    gap: var(--zdp-space-3);
    justify-content: space-between;
  }

  .theme-panel__header h2 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-font-size-xl);
    font-weight: var(--zdp-font-weight-bold);
    margin: 0;
  }

  .preview-section {
    display: grid;
    gap: var(--zdp-space-3);
  }

  .preview-section h3 {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-bold);
    letter-spacing: 0;
    margin: 0;
    text-transform: uppercase;
  }

  .swatches {
    display: grid;
    gap: var(--zdp-space-2);
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .swatch {
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-md);
    min-height: 4.5rem;
    overflow: hidden;
  }

  .swatch__paint {
    display: block;
    height: 2.5rem;
  }

  .swatch__paint--primary {
    background: var(--zdp-color-accent-primary);
  }

  .swatch__paint--success {
    background: var(--zdp-color-accent-success);
  }

  .swatch__paint--warning {
    background: var(--zdp-color-accent-warning);
  }

  .swatch__paint--danger {
    background: var(--zdp-color-accent-danger);
  }

  .swatch__label {
    color: var(--zdp-color-ink-muted);
    display: block;
    font-size: var(--zdp-font-size-xs);
    padding: var(--zdp-space-2);
    text-decoration: none;
  }

  [data-zdp-theme="dark"] .swatch__label {
    background: var(--zdp-color-surface-inverse);
    color: var(--zdp-color-ink-inverse);
  }

  .type-sample {
    display: grid;
    gap: var(--zdp-space-2);
    margin: 0;
  }

  .type-sample strong {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-font-size-xl);
    line-height: var(--zdp-font-line-height-tight);
  }

  .type-sample span {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-font-size-sm);
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
  }

  .focus-demo {
    display: grid;
    gap: var(--zdp-space-3);
    max-width: 28rem;
  }

  .focus-demo__field {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .focus-demo__field span {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
  }

  .feedback-stack {
    display: grid;
    gap: var(--zdp-space-3);
    max-width: 34rem;
  }

  .dialog-demo {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-2);
    max-width: 32rem;
  }

  .dialog-demo p {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
  }

  .form-grid {
    display: grid;
    gap: var(--zdp-space-4);
    max-width: 32rem;
  }

  .choice-grid {
    display: grid;
    gap: var(--zdp-space-4);
    max-width: 32rem;
  }

  .choice-stack {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .choice-group-label {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
  }

  .surface-grid {
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .surface-grid :global(.zdp-surface) {
    min-height: 8rem;
  }

  .surface-kicker {
    color: var(--zdp-color-accent-danger);
    display: block;
    font-size: var(--zdp-font-size-xs);
    font-weight: var(--zdp-font-weight-semibold);
    margin-bottom: var(--zdp-space-2);
  }

  .surface-grid p {
    color: inherit;
    font-size: var(--zdp-font-size-sm);
    margin: var(--zdp-space-2) 0 0;
  }

  .foundation-strip {
    --storybook-type-body-small: var(--zdp-type-body-small-size);
    --storybook-type-caption: var(--zdp-type-caption-size);
    --storybook-type-data: var(--zdp-type-data-size);
    --storybook-control-border-width: var(--zdp-control-border-width);
    --storybook-focus-outline-width: var(--zdp-control-focus-outline-width);
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .foundation-strip article {
    background: var(--zdp-color-surface-panel);
    border: 1px solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
    padding: var(--zdp-space-4);
  }

  .foundation-strip span {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-bold);
    line-height: var(--zdp-type-label-line-height);
    text-transform: uppercase;
  }

  .foundation-strip strong {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .motif-strip {
    align-items: center;
    color: var(--zdp-color-line-strong);
    display: grid;
    gap: var(--zdp-space-3);
    grid-template-columns: 1fr auto 1fr;
  }

  .motif-strip__line {
    background: currentcolor;
    display: block;
    height: 1px;
  }

  .motif-strip__mark {
    color: var(--zdp-color-accent-warning);
    font-size: var(--zdp-font-size-xl);
    line-height: 1;
  }

  @media (max-width: 860px) {
    .storybook-preview {
      padding: var(--zdp-space-4);
    }

    .storybook-preview__header {
      align-items: start;
      display: grid;
    }

    .storybook-preview__header h1 {
      font-size: 2.5rem;
    }

    .storybook-preview__grid,
    .foundation-strip,
    .surface-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .swatches {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
