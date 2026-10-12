import { readFile } from 'node:fs/promises';
import { readConsumerContract } from '../consumer-document';
import { join, relative } from 'node:path';
import type { PackageCheckContext, PackageJson } from './context';

export function createAdoptionChecks(context: PackageCheckContext) {
const { root, failures } = context;

async function checkExternalAdoptionContract(): Promise<void> {
  const adoptionPath = 'docs/EXTERNAL_UI_ADOPTION.md';
  const noticesPath = 'THIRD_PARTY_NOTICES.md';
  const adoption = await readFile(join(root, adoptionPath), 'utf8');
  const notices = await readFile(join(root, noticesPath), 'utf8');

  for (const requiredText of [
    '외부 UI 라이브러리는 ZDP의 dependency source가 아니라 검증 source다.',
    'Runtime Dependency',
    'Source Adapted',
    'Prohibited',
    'bits-ui` 타입, prop 이름, store shape, Tailwind class, shadcn registry 파일 구조가 ZDP public export로 새면 실패다.',
    'Tailwind Plus / Tailwind UI',
    'Provenance Template',
    'consumer fixture build'
  ]) {
    if (!adoption.includes(requiredText)) {
      failures.push(`${adoptionPath} is missing external adoption contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Simple Icons',
    'CC0-1.0',
    'Telegram, LINE, WhatsApp, X, Reddit, Facebook, Threads, Bluesky, and Sina Weibo',
    '`src/lib/share.ts`',
    'docs/EXTERNAL_UI_ADOPTION.md',
    'Tailwind Plus and Tailwind UI',
    'If any additional third-party source code, data, or assets are copied, ported, or meaningfully adapted later, update this file in the same change.'
  ]) {
    if (!notices.includes(requiredText)) {
      failures.push(`${noticesPath} is missing third-party notice contract text ${requiredText}.`);
    }
  }
}

async function checkInteractivePrimitiveAuditContract(): Promise<void> {
  const auditPath = 'docs/INTERACTIVE_PRIMITIVE_AUDIT.md';
  const audit = await readFile(join(root, auditPath), 'utf8');

  for (const requiredText of [
    '`Select`와 `CommandField`는 native element를 중심으로 둔 현재 구현을 유지한다.',
    '`Combobox`는 searchable single-select를 ZDP-native로 제공하되 filtering, async search, command execution, permissions는 소비 앱에 남긴다.',
    '| Combobox | ZDP custom combobox/listbox | Medium |',
    '`Menu`와 `Popover`는 가장 높은 위험군이다.',
    '| Menu | Bits UI DropdownMenu adapter | High |',
    '| Popover | Bits UI Popover adapter | High |',
    '모바일 keyboard, 긴 옵션, async option, grouped option, virtualized list, collision 반복 요구는 `Menu`, `Popover`, `Combobox` 안에서 계속 키우지 않고 `Sheet` flow 또는 headless spike로 보낸다.',
    'InteractionProbe는 ArrowDown open, roving focus, disabled skip, Home/End, Escape close, focus return, click select를 계속 확인한다.',
    'InteractionProbe와 Chromium gate는 ArrowDown open, disabled skip, Enter select, Escape close, IME composition 보호, listbox label, selected value sync를 계속 확인한다.',
    'InteractionProbe는 trigger focus 유지, Escape close, focus return, outside click close를 계속 확인한다.',
    'Headless Spike Trigger',
    'public API, class, token, consumer setup에 외부 철학이 새면 spike는 실패다.',
    'typeahead',
    'collision detection, flip, shift',
    'portal target'
  ]) {
    if (!audit.includes(requiredText)) {
      failures.push(`${auditPath} is missing interactive primitive audit text ${requiredText}.`);
    }
  }
}

async function checkComboboxContract(): Promise<void> {
  const relativePath = 'src/lib/components/Combobox.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const publicEntry = await readFile(join(root, 'src/lib/index.ts'), 'utf8');
  const consumerContract = await readConsumerContract(root);

  for (const requiredText of [
    "import type { ZdpComboboxOption, ZdpComboboxSize }",
    'role="combobox"',
    'aria-autocomplete="list"',
    'aria-haspopup="listbox"',
    'aria-activedescendant={activeOptionDomId ?? undefined}',
    'role="listbox"',
    'role="option"',
    'aria-selected={option.value === value}',
    'aria-disabled={option.disabled ?',
    'handleInputKeydown',
    'event.isComposing',
    'event.keyCode === 229',
    'moveActiveOption',
    'resolveActiveOptionId',
    'onQueryChange?.(query)',
    'const nextQuery = selectedOptionLabel || query',
    'onQueryChange?.(nextQuery)',
    'onValueChange?.(value, option)',
    '.zdp-combobox',
    '.zdp-combobox__control:focus-within',
    '.zdp-combobox__option[data-active="true"]',
    '-webkit-user-select: none',
    'user-select: none'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing combobox contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export { default as Combobox }',
    'export type { ZdpComboboxOption'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing Combobox public entry ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Combobox는 검색 가능한 단일 선택',
    '실제 필터링, async search, command 실행, 권한 판단은 소비 앱이 계속 소유한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing Combobox consumer contract text ${requiredText}.`);
    }
  }
}

return { checkExternalAdoptionContract, checkInteractivePrimitiveAuditContract, checkComboboxContract };
}
