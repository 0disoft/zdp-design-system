import type { StorybookCheckContext } from './context';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from '../style-contract';

export function checkOverlaysContracts(context: StorybookCheckContext): void {
  const { failures, component, buttonsComponent, buttonPlayground, dataDisplayComponent, feedbackComponent, formsComponent, interactionComponent, interactionProbe, navigationComponent, themeLocaleStressComponent, avatar, breadcrumb, button, callout, checkbox, codeBlock, combobox, commandField, confirmAction, dialog, disclosure, field, input, kbd, keyValue, label, localeSwitcher, menu, pagination, popover, progress, radio, select, segmentedControl, shareDock, sheet, shortcutHint, skeleton, tooltip, sortHeader, spinner, switchComponent, tabs, table, termSheet, termTrigger, textarea, textScaleControl, themeToggle, toast, icon, iconButton, identityChip, surface, previewStyle, assertScopedSelectionBlocking, assertNoReadableSelectionBlocking } = context;

  for (const requiredText of [
    'interface TabItem',
    'interface Props',
    'selectedId = $bindable(null)',
    'resolvedIdPrefix',
    'role="tablist"',
    'tabindex="-1"',
    'role="tab"',
    'role="tabpanel"',
    '{#each items as item (item.id)}',
    'id={panelId(item.id)}',
    'aria-labelledby={tabId(item.id)}',
    'hidden={item.id !== activeId}',
    'slot_element_deprecated legacy let: slot contract remains public',
    '<slot selectedId={selectedItem.id} selectedItem={selectedItem} />',
    'aria-selected={item.id === activeId}',
    'aria-controls={panelId(item.id)}',
    'tabindex={item.id === activeId ? 0 : undefined}',
    '.zdp-tabs__tab--active',
    'display: inline-flex',
    'align-items: center',
    'justify-content: center',
    '.zdp-tabs__tab:focus-visible',
    '.zdp-tabs__panel:focus-visible',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)'
  ]) {
    if (!tabs.includes(requiredText)) {
      failures.push(`Tabs component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Tabs component', tabs);

  assertNoOverRoundedUsage(failures, 'Tabs component', tabs);

  for (const requiredText of [
    'id={id ?? undefined}',
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby={labelledBy}',
    'aria-describedby={describedBy ?? undefined}',
    'bind:this={panelElement}',
    '.zdp-dialog',
    '.zdp-dialog__backdrop',
    '.zdp-dialog__panel',
    '.zdp-dialog__panel:focus-visible',
    '.zdp-dialog__close:focus-visible',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)'
  ]) {
    if (!dialog.includes(requiredText)) {
      failures.push(`Dialog component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Dialog component', dialog);

  assertNoOverRoundedUsage(failures, 'Dialog component', dialog);

  for (const requiredText of [
    "import type { ZdpSheetPlacement, ZdpSheetSize }",
    'export let open = false',
    'export let id: string | null = null',
    'export let labelledBy: string',
    "export let placement: ZdpSheetPlacement = 'right'",
    "export let size: ZdpSheetSize = 'md'",
    'export let closeOnEscape = true',
    'export let closeOnBackdrop = true',
    'onClose: (() => void) | null = null',
    'class="zdp-sheet__backdrop"',
    'class={`zdp-sheet zdp-sheet--${placement} zdp-sheet--${size}`}',
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby={labelledBy}',
    'aria-describedby={describedBy ?? undefined}',
    'data-zdp-sheet-placement={placement}',
    'data-zdp-sheet-size={size}',
    'data-zdp-sheet-surface="sheet"',
    'class="zdp-sheet__close"',
    '.zdp-sheet__backdrop',
    '.zdp-sheet--right',
    '.zdp-sheet--left',
    '.zdp-sheet--bottom',
    '.zdp-sheet:focus-visible',
    '.zdp-sheet__close:focus-visible',
    '-webkit-user-select: none',
    'user-select: none',
    '@media (max-width: 720px)'
  ]) {
    if (!sheet.includes(requiredText)) {
      failures.push(`Sheet component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Sheet component', sheet);

  assertNoOverRoundedUsage(failures, 'Sheet component', sheet);

  for (const requiredText of [
    "import type { ZdpTermSheetPlacement, ZdpTermSheetTerm }",
    'interface Props',
    'open = $bindable(false)',
    'id = fallbackId',
    'term = null',
    "placement = 'right'",
    'onClose?: (() => void) | null',
    'onRelatedTerm?: ((termId: string) => void) | null',
    'class="zdp-term-sheet__backdrop"',
    'class={`zdp-term-sheet zdp-term-sheet--${resolvedPlacement}`}',
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby={titleId}',
    'aria-describedby={descriptionId}',
    'data-zdp-ad-exclude="true"',
    'class="zdp-term-sheet__close"',
    'class="zdp-term-sheet__related-button"',
    'data-term-id={relatedTerm.id}',
    '.zdp-term-sheet__backdrop',
    '.zdp-term-sheet--right',
    '.zdp-term-sheet--bottom',
    '.zdp-term-sheet:focus-visible',
    '.zdp-term-sheet__close:focus-visible',
    '.zdp-term-sheet__related-button:focus-visible',
    '-webkit-user-select: none',
    'user-select: none',
    '@media (max-width: 720px)'
  ]) {
    if (!termSheet.includes(requiredText)) {
      failures.push(`TermSheet component is missing ${requiredText}.`);
    }
  }

  for (const [label, source] of [
    ['TermSheet component', termSheet],
    ['Interaction story', interactionComponent]
  ] as const) {
    for (const forbiddenText of ['canonicalPath', 'detailLabel', 'zdp-term-sheet__footer', 'zdp-term-sheet__detail-link']) {
      if (source.includes(forbiddenText)) {
        failures.push(`${label} must not restore the removed TermSheet detail action contract ${forbiddenText}.`);
      }
    }
  }

  for (const requiredText of [
    'export let termId: string',
    'export let controls: string | null = null',
    'export let expanded = false',
    'export let disabled = false',
    'onopen: ((termId: string) => void) | null = null',
    'data-term-id={termId}',
    'aria-controls={resolvedControls ?? undefined}',
    'aria-expanded={controls === null ? undefined : expanded}',
    'aria-haspopup="dialog"',
    '.zdp-term-trigger',
    'background: var(--zdp-color-accent-primary-soft)',
    'border: 0',
    'font-weight: var(--zdp-font-weight-medium)',
    'padding: 0 0.2rem',
    '.zdp-term-trigger:hover:not(:disabled)',
    'color: var(--zdp-color-ink-strong)',
    'transition: color var(--zdp-motion-fast) ease',
    '.zdp-term-trigger:focus-visible',
    'background: var(--zdp-color-focus-surface)',
    'color: var(--zdp-color-focus-text)'
  ]) {
    if (!termTrigger.includes(requiredText)) {
      failures.push(`TermTrigger component is missing ${requiredText}.`);
    }
  }

  if (termTrigger.includes('border-block-end:')) {
    failures.push('TermTrigger component must not resemble an underlined text field in its default state.');
  }

  if (termTrigger.includes('-webkit-user-select: none') || termTrigger.includes('user-select: none')) {
    failures.push('TermTrigger component must keep inline term text selectable.');
  }

  assertNoDecorativeEffects(failures, 'TermSheet component', termSheet);

  assertNoDecorativeEffects(failures, 'TermTrigger component', termTrigger);

  assertNoOverRoundedUsage(failures, 'TermSheet component', termSheet);

  assertNoOverRoundedUsage(failures, 'TermTrigger component', termTrigger);

  for (const source of [checkbox, field, input, label, radio, select, switchComponent, textarea]) {
    assertNoDecorativeEffects(failures, 'Form component', source);
    assertNoOverRoundedUsage(failures, 'Form component', source);
  }

  for (const requiredText of [
    'onclick: ((event: MouseEvent) => void) | null = null',
    'ariaControls: string | null = null',
    'ariaDescribedBy: string | null = null',
    'ariaExpanded: boolean | null = null',
    'ariaPressed: boolean | null = null',
    'ariaKeyShortcuts: string | null = null',
    'aria-controls={ariaControls ?? undefined}',
    'aria-describedby={ariaDescribedBy ?? undefined}',
    'aria-expanded={ariaExpanded ?? undefined}',
    'aria-pressed={ariaPressed ?? undefined}',
    'aria-keyshortcuts={ariaKeyShortcuts ?? undefined}',
    'onclick={onclick ?? undefined}',
    '.zdp-icon-button--solid:active:not(:disabled)',
    '.zdp-icon-button--solid:hover:not(:disabled)',
    '.zdp-icon-button--ghost:hover:not(:disabled)',
    'border: var(--zdp-control-border-width) solid transparent',
    'border-color: transparent',
    'background: transparent',
    'font-family: var(--zdp-font-family-sans)',
    'font-weight: var(--zdp-font-weight-regular)',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'border-color: var(--zdp-color-focus-line)',
    '@media (forced-colors: active)',
    'border-color: ButtonText',
    'zdp-icon zdp-icon--${size} zdp-icon-button__glyph',
    'font-size: var(--zdp-control-glyph-md)',
    'text-align: center',
    'align-items: center',
    'justify-content: center',
    'line-height: 1'
  ]) {
    if (!iconButton.includes(requiredText)) {
      failures.push(`IconButton component is missing centered glyph style ${requiredText}.`);
    }
  }

  const flatIconButtonBlock = iconButton.slice(
    iconButton.indexOf('.zdp-icon-button {'),
    iconButton.indexOf('.zdp-icon-button:focus-visible')
  );

  for (const forbiddenText of [
    'border-color: var(--zdp-color-line-',
    'border-color: var(--zdp-color-accent-primary-strong)'
  ]) {
    if (flatIconButtonBlock.includes(forbiddenText)) {
      failures.push(`IconButton visual variants must not restore visible borders: ${forbiddenText}.`);
    }
  }

  for (const [surfaceLabel, source] of [
    ['Avatar component initials', avatar],
    ['Breadcrumb component separator', breadcrumb],
    ['Button component', button],
    ['Checkbox component', checkbox],
    ['Callout component mark', callout],
    ['CodeBlock component copy action', codeBlock],
    ['Combobox component controls', combobox],
    ['CommandField component shortcut', commandField],
    ['ConfirmAction component', confirmAction],
    ['Dialog component close button', dialog],
    ['Disclosure component trigger', disclosure],
    ['Icon component', icon],
    ['IconButton component', iconButton],
    ['Kbd component', kbd],
    ['Label component required mark', label],
    ['LocaleSwitcher component controls', localeSwitcher],
    ['Menu component controls', menu],
    ['Pagination component controls', pagination],
    ['Popover component trigger', popover],
    ['Progress component marks', progress],
    ['Radio component', radio],
    ['SegmentedControl component items', segmentedControl],
    ['ShareDock component actions', shareDock],
    ['Sheet component controls', sheet],
    ['ShortcutHint component', shortcutHint],
    ['Skeleton component', skeleton],
    ['SortHeader component', sortHeader],
    ['Spinner component', spinner],
    ['Switch component', switchComponent],
    ['Tabs component tab', tabs],
    ['TermSheet component controls', termSheet],
    ['TextScaleControl component controls', textScaleControl],
    ['ThemeToggle component', themeToggle],
    ['Toast component controls', toast],
    ['Tooltip component content', tooltip]
  ] as const) {
    assertScopedSelectionBlocking(surfaceLabel, source);
  }

  for (const [surfaceLabel, source] of [
    ['CodeBlock component readable code', codeBlock],
    ['Table component readable cells', table],
    ['Toast component readable message', toast],
    ['IdentityChip component readable text', identityChip],
    ['KeyValue component readable values', keyValue],
    ['TermTrigger component readable inline text', termTrigger]
  ] as const) {
    assertNoReadableSelectionBlocking(surfaceLabel, source);
  }

  assertNoDecorativeEffects(failures, 'Button component', button);

  assertNoDecorativeEffects(failures, 'Icon component', icon);

  assertNoDecorativeEffects(failures, 'IconButton component', iconButton);

  assertNoDecorativeEffects(failures, 'LocaleSwitcher component', localeSwitcher);

  assertNoDecorativeEffects(failures, 'TextScaleControl component', textScaleControl);

  assertNoDecorativeEffects(failures, 'ThemeToggle component', themeToggle);

  assertNoDecorativeEffects(failures, 'Surface component', surface);

  assertNoDecorativeEffects(failures, 'Storybook overview', component);

  assertNoDecorativeEffects(failures, 'Storybook preview CSS', previewStyle);

  assertNoDecorativeEffects(failures, 'Buttons story', buttonsComponent);

  assertNoDecorativeEffects(failures, 'Button controls story', buttonPlayground);

  assertNoDecorativeEffects(failures, 'Data display story', dataDisplayComponent);

  assertNoDecorativeEffects(failures, 'Feedback story', feedbackComponent);

  assertNoDecorativeEffects(failures, 'Forms story', formsComponent);

  assertNoDecorativeEffects(failures, 'Interaction story', interactionComponent);

  assertNoDecorativeEffects(failures, 'Interaction probe story', interactionProbe);

  assertNoDecorativeEffects(failures, 'Navigation story', navigationComponent);

  assertNoDecorativeEffects(failures, 'Theme locale stress story', themeLocaleStressComponent);

  assertNoOverRoundedUsage(failures, 'Button component', button);

  assertNoOverRoundedUsage(failures, 'Icon component', icon);

  assertNoOverRoundedUsage(failures, 'IconButton component', iconButton);

  assertNoOverRoundedUsage(failures, 'Surface component', surface);

  assertNoOverRoundedUsage(failures, 'Storybook overview', component);

  assertNoOverRoundedUsage(failures, 'Storybook preview CSS', previewStyle);

  assertNoOverRoundedUsage(failures, 'Buttons story', buttonsComponent);

  assertNoOverRoundedUsage(failures, 'Button controls story', buttonPlayground);

  assertNoOverRoundedUsage(failures, 'Data display story', dataDisplayComponent);

  assertNoOverRoundedUsage(failures, 'Feedback story', feedbackComponent);

  assertNoOverRoundedUsage(failures, 'Forms story', formsComponent);

  assertNoOverRoundedUsage(failures, 'Interaction story', interactionComponent);

  assertNoOverRoundedUsage(failures, 'Interaction probe story', interactionProbe);

  assertNoOverRoundedUsage(failures, 'Navigation story', navigationComponent);

  assertNoOverRoundedUsage(failures, 'Theme locale stress story', themeLocaleStressComponent);
}
