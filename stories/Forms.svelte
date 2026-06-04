<script lang="ts">
  import Checkbox from '../src/lib/components/Checkbox.svelte';
  import ErrorText from '../src/lib/components/ErrorText.svelte';
  import Field from '../src/lib/components/Field.svelte';
  import HelpText from '../src/lib/components/HelpText.svelte';
  import Input from '../src/lib/components/Input.svelte';
  import Label from '../src/lib/components/Label.svelte';
  import Radio from '../src/lib/components/Radio.svelte';
  import Select from '../src/lib/components/Select.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Switch from '../src/lib/components/Switch.svelte';
  import Textarea from '../src/lib/components/Textarea.svelte';
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Forms</p>
    <h1>Control states</h1>
  </header>

  <div class="component-story__grid">
    <section class="component-story__panel" data-zdp-theme="light" aria-labelledby="forms-light-title">
      <h2 id="forms-light-title">Light</h2>
      <Surface padding="lg">
        <Stack gap="lg">
          <Field required>
            <Label forId="forms-light-name" required>이름</Label>
            <Input id="forms-light-name" name="forms-light-name" placeholder="홍길동" describedBy="forms-light-name-help" required />
            <HelpText id="forms-light-name-help">공개 표기와 알림에 사용됩니다.</HelpText>
          </Field>

          <Field readonly>
            <Label forId="forms-light-id">고정 ID</Label>
            <Input id="forms-light-id" name="forms-light-id" value="ZDP-2401" describedBy="forms-light-id-help" readonly />
            <HelpText id="forms-light-id-help">이미 발급된 값은 그대로 둡니다.</HelpText>
          </Field>

          <Field invalid>
            <Label forId="forms-light-status">상태</Label>
            <Select
              id="forms-light-status"
              name="forms-light-status"
              value="blocked"
              describedBy={['forms-light-status-help', 'forms-light-status-error']}
              errorMessageId="forms-light-status-error"
              invalid
            >
              <option value="ready">준비됨</option>
              <option value="blocked">확인 필요</option>
            </Select>
            <HelpText id="forms-light-status-help">현재 작업 상태를 선택하세요.</HelpText>
            <ErrorText id="forms-light-status-error">다음 단계 전에 기준을 확인하세요.</ErrorText>
          </Field>

          <Field>
            <Label forId="forms-light-note">메모</Label>
            <Textarea id="forms-light-note" name="forms-light-note" placeholder="짧게 남기기" describedBy="forms-light-note-help" rows={3} />
            <HelpText id="forms-light-note-help">긴 문장은 줄바꿈으로 자연스럽게 이어집니다.</HelpText>
          </Field>

          <Field disabled>
            <Label forId="forms-light-email">초대 메일</Label>
            <Input
              id="forms-light-email"
              name="forms-light-email"
              type="email"
              value="team@example.com"
              describedBy="forms-light-email-help"
              disabled
            />
            <HelpText id="forms-light-email-help">초대 기능이 열리면 수정할 수 있습니다.</HelpText>
          </Field>

          <Stack gap="md">
            <Checkbox id="forms-light-updates" name="forms-light-updates" describedBy="forms-light-updates-help" checked>
              업데이트 받기
              <span slot="help" class="zdp-help-text" id="forms-light-updates-help">중요한 변경만 보냅니다.</span>
            </Checkbox>
            <div class="choice-stack" role="radiogroup" aria-labelledby="forms-light-frequency">
              <span class="choice-group-label" id="forms-light-frequency">알림 주기</span>
              <Radio id="forms-light-weekly" name="forms-light-frequency" value="weekly" checked>매주</Radio>
              <Radio id="forms-light-monthly" name="forms-light-frequency" value="monthly">매월</Radio>
            </div>
            <Switch id="forms-light-autosave" name="forms-light-autosave" describedBy="forms-light-autosave-help" checked>
              자동 저장
              <span slot="help" class="zdp-help-text" id="forms-light-autosave-help">작성 중인 내용을 임시 보관합니다.</span>
            </Switch>
          </Stack>
        </Stack>
      </Surface>
    </section>

    <section class="component-story__panel" data-zdp-theme="dark" aria-labelledby="forms-dark-title">
      <h2 id="forms-dark-title">Dark</h2>
      <Surface padding="lg">
        <Stack gap="lg">
          <Field required>
            <Label forId="forms-dark-name" required>이름</Label>
            <Input id="forms-dark-name" name="forms-dark-name" placeholder="홍길동" describedBy="forms-dark-name-help" required />
            <HelpText id="forms-dark-name-help">공개 표기와 알림에 사용됩니다.</HelpText>
          </Field>

          <Field readonly>
            <Label forId="forms-dark-id">고정 ID</Label>
            <Input id="forms-dark-id" name="forms-dark-id" value="ZDP-2401" describedBy="forms-dark-id-help" readonly />
            <HelpText id="forms-dark-id-help">이미 발급된 값은 그대로 둡니다.</HelpText>
          </Field>

          <Field invalid>
            <Label forId="forms-dark-status">상태</Label>
            <Select
              id="forms-dark-status"
              name="forms-dark-status"
              value="blocked"
              describedBy={['forms-dark-status-help', 'forms-dark-status-error']}
              errorMessageId="forms-dark-status-error"
              invalid
            >
              <option value="ready">준비됨</option>
              <option value="blocked">확인 필요</option>
            </Select>
            <HelpText id="forms-dark-status-help">현재 작업 상태를 선택하세요.</HelpText>
            <ErrorText id="forms-dark-status-error">다음 단계 전에 기준을 확인하세요.</ErrorText>
          </Field>

          <Field>
            <Label forId="forms-dark-note">메모</Label>
            <Textarea id="forms-dark-note" name="forms-dark-note" placeholder="짧게 남기기" describedBy="forms-dark-note-help" rows={3} />
            <HelpText id="forms-dark-note-help">긴 문장은 줄바꿈으로 자연스럽게 이어집니다.</HelpText>
          </Field>

          <Field disabled>
            <Label forId="forms-dark-email">초대 메일</Label>
            <Input
              id="forms-dark-email"
              name="forms-dark-email"
              type="email"
              value="team@example.com"
              describedBy="forms-dark-email-help"
              disabled
            />
            <HelpText id="forms-dark-email-help">초대 기능이 열리면 수정할 수 있습니다.</HelpText>
          </Field>

          <Stack gap="md">
            <Checkbox id="forms-dark-updates" name="forms-dark-updates" describedBy="forms-dark-updates-help" checked>
              업데이트 받기
              <span slot="help" class="zdp-help-text" id="forms-dark-updates-help">중요한 변경만 보냅니다.</span>
            </Checkbox>
            <div class="choice-stack" role="radiogroup" aria-labelledby="forms-dark-frequency">
              <span class="choice-group-label" id="forms-dark-frequency">알림 주기</span>
              <Radio id="forms-dark-weekly" name="forms-dark-frequency" value="weekly" checked>매주</Radio>
              <Radio id="forms-dark-monthly" name="forms-dark-frequency" value="monthly">매월</Radio>
            </div>
            <Switch id="forms-dark-autosave" name="forms-dark-autosave" describedBy="forms-dark-autosave-help" checked>
              자동 저장
              <span slot="help" class="zdp-help-text" id="forms-dark-autosave-help">작성 중인 내용을 임시 보관합니다.</span>
            </Switch>
          </Stack>
        </Stack>
      </Surface>
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

  .component-story__panel h2 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
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

  @media (max-width: 860px) {
    .component-story {
      padding: var(--zdp-space-4);
    }

    .component-story__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
