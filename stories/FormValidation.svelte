<script lang="ts">
  import Checkbox from '../src/lib/components/Checkbox.svelte';
  import Combobox from '../src/lib/components/Combobox.svelte';
  import ErrorText from '../src/lib/components/ErrorText.svelte';
  import Field from '../src/lib/components/Field.svelte';
  import HelpText from '../src/lib/components/HelpText.svelte';
  import Input from '../src/lib/components/Input.svelte';
  import Label from '../src/lib/components/Label.svelte';
  import Radio from '../src/lib/components/Radio.svelte';
  import Select from '../src/lib/components/Select.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Switch from '../src/lib/components/Switch.svelte';
  import Textarea from '../src/lib/components/Textarea.svelte';

  const options = [{ id: 'team', value: 'team', label: '플랫폼 운영' }];
  const themes = ['light', 'dark'] as const;
  const states = ['invalid', 'disabled'] as const;
  const initialFields = () => ({ name: '김', note: '검토 중', status: 'blocked', owner: '', updates: false, frequency: '', autosave: false });
  const forms = $state({
    light: { invalid: initialFields(), disabled: initialFields() },
    dark: { invalid: initialFields(), disabled: initialFields() }
  });
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Forms</p>
    <h1>오류와 비활성 상태</h1>
  </header>
  <div class="component-story__grid">
    {#each themes as theme}
      <section class="component-story__panel" data-zdp-theme={theme} aria-labelledby={`validation-${theme}-title`}>
        <h2 id={`validation-${theme}-title`}>{theme === 'light' ? 'Light' : 'Dark'}</h2>
        <Stack gap="lg">
          {#each states as state}
            {@const prefix = `validation-${theme}-${state}`}
            {@const disabled = state === 'disabled'}
            {@const fields = forms[theme][state]}
            {@const nameInvalid = !disabled && Array.from(fields.name.trim()).length < 2}
            {@const noteInvalid = !disabled && Array.from(fields.note.trim()).length < 8}
            {@const statusInvalid = !disabled && fields.status !== 'ready'}
            {@const ownerInvalid = !disabled && fields.owner === ''}
            {@const updatesInvalid = !disabled && !fields.updates}
            <h3>{disabled ? '지금은 변경할 수 없어요' : '입력 확인'}</h3>
            <Field invalid={nameInvalid} {disabled}>
              <Label forId={`${prefix}-name`}>이름</Label>
              <Input id={`${prefix}-name`} bind:value={fields.name} invalid={nameInvalid} {disabled}
                describedBy={`${prefix}-name-help${nameInvalid ? ` ${prefix}-name-error` : ''}`}
                errorMessageId={nameInvalid ? `${prefix}-name-error` : null} />
              <HelpText id={`${prefix}-name-help`}>공개 프로필에 표시됩니다.</HelpText>
              {#if nameInvalid}<ErrorText id={`${prefix}-name-error`}>이름을 두 글자 이상 입력하세요.</ErrorText>{/if}
            </Field>
            <Field invalid={noteInvalid} {disabled}>
              <Label forId={`${prefix}-note`}>메모</Label>
              <Textarea id={`${prefix}-note`} bind:value={fields.note} rows={2} invalid={noteInvalid} {disabled}
                describedBy={`${prefix}-note-help${noteInvalid ? ` ${prefix}-note-error` : ''}`}
                errorMessageId={noteInvalid ? `${prefix}-note-error` : null} />
              <HelpText id={`${prefix}-note-help`}>다음 담당자에게 전달할 내용을 남기세요.</HelpText>
              {#if noteInvalid}<ErrorText id={`${prefix}-note-error`}>메모를 여덟 글자 이상 입력하세요.</ErrorText>{/if}
            </Field>
            <Field invalid={statusInvalid} {disabled}>
              <Label forId={`${prefix}-status`}>상태</Label>
              <Select id={`${prefix}-status`} bind:value={fields.status} invalid={statusInvalid} {disabled}
                describedBy={`${prefix}-status-help${statusInvalid ? ` ${prefix}-status-error` : ''}`}
                errorMessageId={statusInvalid ? `${prefix}-status-error` : null}>
                <option value="ready">준비됨</option>
                <option value="blocked">확인 필요</option>
              </Select>
              <HelpText id={`${prefix}-status-help`}>현재 작업 상태를 선택하세요.</HelpText>
              {#if statusInvalid}<ErrorText id={`${prefix}-status-error`}>'준비됨'을 선택해야 다음 단계로 갈 수 있어요.</ErrorText>{/if}
            </Field>
            <Field invalid={ownerInvalid} {disabled}>
              <Label forId={`${prefix}-owner`}>담당</Label>
              <Combobox id={`${prefix}-owner`} label={null} ariaLabel="담당" {options} bind:value={fields.owner}
                listboxLabel="담당 목록" openLabel="선택 열기" closeLabel="선택 닫기"
                placeholder="담당 팀 찾기" invalid={ownerInvalid} {disabled}
                describedBy={`${prefix}-owner-help${ownerInvalid ? ` ${prefix}-owner-error` : ''}`}
                errorMessageId={ownerInvalid ? `${prefix}-owner-error` : null} />
              <HelpText id={`${prefix}-owner-help`}>검토를 맡을 팀을 선택하세요.</HelpText>
              {#if ownerInvalid}<ErrorText id={`${prefix}-owner-error`}>담당 팀을 선택해야 합니다.</ErrorText>{/if}
            </Field>
            <Checkbox id={`${prefix}-updates`} bind:checked={fields.updates} invalid={updatesInvalid} {disabled}
              describedBy={updatesInvalid ? `${prefix}-choice-error` : null}>검토 기준을 확인했습니다</Checkbox>
            {#if updatesInvalid}<ErrorText id={`${prefix}-choice-error`}>검토 기준을 확인한 뒤 체크하세요.</ErrorText>{/if}
            <Radio id={`${prefix}-frequency`} name={`${prefix}-frequency`} value="weekly" bind:selectedValue={fields.frequency} {disabled}>매주 알림 받기</Radio>
            <Switch id={`${prefix}-autosave`} bind:checked={fields.autosave} {disabled}>자동 저장</Switch>
          {/each}
        </Stack>
      </section>
    {/each}
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
    margin: 0;
    text-transform: uppercase;
  }

  .component-story__header h1 {
    color: var(--zdp-color-ink-strong);
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
    align-content: start;
    background: var(--zdp-color-surface-panel);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-5);
    min-width: 0;
    padding: var(--zdp-space-6);
  }

  .component-story__panel h2,
  .component-story__panel h3 {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-medium);
    margin: 0;
  }

  @media (max-width: 860px) {
    .component-story { padding: var(--zdp-space-4); }
    .component-story__grid { grid-template-columns: 1fr; }
  }
</style>
