import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { PackageCheckContext, PackageJson } from './context';

export function createOverlaysChecks(context: PackageCheckContext) {
const { root, failures } = context;

async function checkTermSheetContract(): Promise<void> {
  const relativePath = 'src/lib/components/TermSheet.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const termTypePath = 'src/lib/term.ts';
  const termTypeSource = await readFile(join(root, termTypePath), 'utf8');

  for (const requiredText of [
    '<div class="zdp-term-layer" bind:this={layerElement}>',
    'data-zdp-ad-exclude="true"',
    'data-term-id={term.id}',
    'data-zdp-term-id={term.id}',
    'data-zdp-term-placement={resolvedPlacement}',
    'data-zdp-term-surface="sheet"',
    'data-zdp-term-id={relatedTerm.id}'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing TermSheet contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide sheet focusability.`);
  }

  for (const [sourcePath, sourceText] of [
    [relativePath, source],
    [termTypePath, termTypeSource]
  ] as const) {
    for (const forbiddenText of ['canonicalPath', 'detailLabel', 'zdp-term-sheet__footer', 'zdp-term-sheet__detail-link']) {
      if (sourceText.includes(forbiddenText)) {
        failures.push(`${sourcePath} must not restore the removed TermSheet detail action contract ${forbiddenText}.`);
      }
    }
  }
}

async function checkSplitPaneContract(): Promise<void> {
  const componentPath = 'src/lib/components/ResizableSplitPane.svelte';
  const helperPath = 'src/lib/split-pane.ts';
  const component = await readFile(join(root, componentPath), 'utf8');
  const helper = await readFile(join(root, helperPath), 'utf8');

  for (const requiredText of [
    'createZdpSplitPaneController',
    'controller?.update(createControllerOptions())',
    'bind:this={primaryElement}',
    'bind:this={secondaryElement}',
    'role="separator"',
    'aria-controls={resolvedPrimaryId}',
    'aria-valuemin={normalizedMinSize}',
    'aria-valuemax={normalizedMaxSize}',
    'aria-valuenow={renderedSize}',
    'data-zdp-resizable-split-pane-orientation={orientation}'
  ]) {
    if (!component.includes(requiredText)) {
      failures.push(`${componentPath} is missing split pane contract text ${requiredText}.`);
    }
  }

  for (const forbiddenText of ['resize:', 'localStorage', 'setPointerCapture', 'beginZdpDragSelection', 'ResizeObserver']) {
    if (component.includes(forbiddenText)) {
      failures.push(`${componentPath} must not contain ${forbiddenText}; resizing and persistence stay explicit.`);
    }
  }

  for (const requiredText of [
    'export function createZdpSplitPaneController(',
    "'data-zdp-resizable-split-pane-constrained'",
    "const ZDP_SPLIT_PANE_STORAGE_PREFIX = 'zdp:split-pane-size:v1:'",
    "typeof window === 'undefined'",
    'return window.localStorage',
    "storedValue.trim() === ''",
    'clampZdpSplitPaneSize(parsedValue, bounds)',
    "throw new TypeError('Split pane persistence requires a non-empty key.')"
  ]) {
    if (!helper.includes(requiredText)) {
      failures.push(`${helperPath} is missing split pane controller or persistence contract text ${requiredText}.`);
    }
  }
}

async function checkOverlayTokenContract(): Promise<void> {
  const checkedPaths = [
    'src/lib/components/Combobox.svelte',
    'src/lib/components/ConfirmAction.svelte',
    'src/lib/components/Dialog.svelte',
    'src/lib/components/Menu.svelte',
    'src/lib/components/Popover.svelte',
    'src/lib/components/ResizableSplitPane.svelte',
    'src/lib/components/ShareDock.svelte',
    'src/lib/components/Sheet.svelte',
    'src/lib/components/SkipLink.svelte',
    'src/lib/components/StatusToast.svelte',
    'src/lib/components/TermSheet.svelte',
    'src/lib/components/Tooltip.svelte',
    'src/styles/components.css'
  ] as const;

  for (const relativePath of checkedPaths) {
    const source = await readFile(join(root, relativePath), 'utf8');

    if (/z-index:\s*-?\d+\s*;/.test(source)) {
      failures.push(`${relativePath} must use named --zdp-layer-* tokens instead of raw z-index numbers.`);
    }

    if (/\b100v[hw]\b/.test(source)) {
      failures.push(`${relativePath} must use --zdp-viewport-* tokens instead of raw 100vh/100vw sizing.`);
    }
  }
}

async function checkSharedFocusContract(): Promise<void> {
  const focusablePath = 'src/lib/focusable.ts';
  const source = await readFile(join(root, focusablePath), 'utf8');

  for (const requiredText of [
    'zdpFocusableSelector',
    'isZdpFocusableElement',
    'createZdpFocusableCache',
    '[contenteditable]:not([contenteditable="false"])',
    'element.ownerDocument.defaultView',
    'isZdpHtmlElement'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${focusablePath} is missing shared focusability contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${focusablePath} must not use offsetParent to decide focusability.`);
  }
}

async function checkDialogStructureContract(): Promise<void> {
  const relativePath = 'src/lib/components/Dialog.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');

  for (const requiredText of [
    '<div class="zdp-dialog" bind:this={layerElement}>'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing dialog structure contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide dialog focusability.`);
  }
}

async function checkSheetContract(): Promise<void> {
  const relativePath = 'src/lib/components/Sheet.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const publicEntry = await readFile(join(root, 'src/lib/index.ts'), 'utf8');
  const consumerContract = await readFile(join(root, 'docs/CONSUMER_CONTRACT.md'), 'utf8');

  for (const requiredText of [
    "import type { ZdpSheetPlacement, ZdpSheetSize }",
    '<div class="zdp-sheet-layer" bind:this={layerElement}>',
    'class="zdp-sheet__backdrop"',
    'class={`zdp-sheet zdp-sheet--${placement} zdp-sheet--${size}`}',
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby={labelledBy}',
    'aria-describedby={describedBy ?? undefined}',
    'data-zdp-sheet-placement={placement}',
    'data-zdp-sheet-size={size}',
    'data-zdp-sheet-surface="sheet"',
    'createZdpFocusableCache',
    'focusableCache.get()',
    'focusableCache.destroy()',
    'closeOnEscape',
    'closeOnBackdrop',
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
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing Sheet contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'export { default as Sheet }',
    'export type { ZdpSheetPlacement'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing Sheet public entry ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Sheet는 right, left, bottom edge panel',
    '설정, 필터, 보조 흐름',
    '저장, 권한, 데이터 fetch, 라우팅 판단은 소비 앱이 계속 소유한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing Sheet consumer contract text ${requiredText}.`);
    }
  }

  if (source.includes('offsetParent')) {
    failures.push(`${relativePath} must not use offsetParent to decide sheet focusability.`);
  }
}

async function checkMenuPopoverInteractionContract(): Promise<void> {
  const menuPath = 'src/lib/components/Menu.svelte';
  const popoverPath = 'src/lib/components/Popover.svelte';
  const menu = await readFile(join(root, menuPath), 'utf8');
  const popover = await readFile(join(root, popoverPath), 'utf8');

  for (const requiredText of [
    'role="menu"',
    'role="menuitem"',
    'tabindex={item.id === activeItemId && !item.disabled ? 0 : -1}',
    "aria-disabled={item.disabled ? 'true' : undefined}"
  ]) {
    if (!menu.includes(requiredText)) {
      failures.push(`${menuPath} is missing menu interaction contract text ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'closeOnEscape = true',
    'closeOnOutside = true',
    'slot name="trigger" open={open} toggle={toggle} close={close} panelId={panelId} triggerId={triggerId}',
    'role={role ?? undefined}',
    'aria-labelledby={labelledBy ?? triggerId}',
    'tabindex="-1"'
  ]) {
    if (!popover.includes(requiredText)) {
      failures.push(`${popoverPath} is missing popover interaction contract text ${requiredText}.`);
    }
  }

}

return { checkTermSheetContract, checkSplitPaneContract, checkOverlayTokenContract, checkSharedFocusContract, checkDialogStructureContract, checkSheetContract, checkMenuPopoverInteractionContract };
}
