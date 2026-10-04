import type { StorybookCheckContext } from './context';
import { assertNoDecorativeEffects, assertNoOverRoundedUsage } from '../style-contract';

export function checkLayoutContracts(context: StorybookCheckContext): void {
  const { failures, breadcrumb, container, divider, emptyState, grid, keyValue, menu, page, pageHeader, pagination, section, shareDock, skipLink, sortHeader, stack, table, tableToolbar, toolbar, visuallyHidden, icon, inline } = context;

  assertNoDecorativeEffects(failures, 'Menu component', menu);

  assertNoOverRoundedUsage(failures, 'Menu component', menu);

  for (const requiredText of [
    '.zdp-skip-link',
    '.zdp-skip-link:focus-visible',
    'href =',
    'position: fixed',
    'pointer-events: none',
    'pointer-events: auto',
    'background: var(--zdp-color-focus-surface)',
    'border: var(--zdp-control-border-width) solid var(--zdp-color-focus-line)',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'text-decoration-line: none'
  ]) {
    if (!skipLink.includes(requiredText)) {
      failures.push(`SkipLink component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'SkipLink component', skipLink);

  assertNoOverRoundedUsage(failures, 'SkipLink component', skipLink);

  for (const requiredText of [
    '.zdp-visually-hidden',
    'clip: rect(0 0 0 0)',
    'clip-path: inset(50%)',
    'height: 1px',
    'position: absolute',
    'white-space: nowrap',
    'width: 1px'
  ]) {
    if (!visuallyHidden.includes(requiredText)) {
      failures.push(`VisuallyHidden component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'VisuallyHidden component', visuallyHidden);

  assertNoOverRoundedUsage(failures, 'VisuallyHidden component', visuallyHidden);

  for (const requiredText of [
    '.zdp-page',
    'as:',
    'tone:',
    'aria-labelledby={labelledBy ?? undefined}',
    'zdp-surface-reset',
    'display: grid',
    'min-block-size: 100%',
    '.zdp-page--canvas',
    '.zdp-page--panel'
  ]) {
    if (!page.includes(requiredText)) {
      failures.push(`Page component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Page component', page);

  assertNoOverRoundedUsage(failures, 'Page component', page);

  for (const requiredText of [
    '.zdp-container',
    'as:',
    'size:',
    'padding:',
    'gutter:',
    "gutter === 'page'",
    'aria-labelledby={labelledBy ?? undefined}',
    'inline-size: 100%',
    'margin-inline: auto',
    '.zdp-container--sm',
    '.zdp-container--md',
    '.zdp-container--lg',
    '.zdp-container--xl',
    '.zdp-container--full',
    '.zdp-container--padding-lg',
    '.zdp-container--padding-page'
  ]) {
    if (!container.includes(requiredText)) {
      failures.push(`Container component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Container component', container);

  assertNoOverRoundedUsage(failures, 'Container component', container);

  for (const requiredText of [
    '.zdp-section',
    'as:',
    'spacing:',
    'tone:',
    'aria-labelledby={labelledBy ?? undefined}',
    '.zdp-section--spacing-lg',
    '.zdp-section--spacing-xl',
    '.zdp-section--plain',
    '.zdp-section--panel',
    '.zdp-section--raised',
    'border-block: 1px solid var(--zdp-color-line-subtle)'
  ]) {
    if (!section.includes(requiredText)) {
      failures.push(`Section component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Section component', section);

  assertNoOverRoundedUsage(failures, 'Section component', section);

  for (const requiredText of [
    '.zdp-page-header',
    'as:',
    'align:',
    'labelledHeaderRole',
    'role={labelledHeaderRole}',
    'aria-labelledby={labelledBy ?? undefined}',
    'slot name="eyebrow"',
    'class="zdp-page-header__title"',
    'slot name="summary"',
    'class="zdp-page-header__actions"',
    'grid-template-columns: minmax(0, 1fr) auto',
    'flex-wrap: wrap',
    '@media (max-width: 48rem)'
  ]) {
    if (!pageHeader.includes(requiredText)) {
      failures.push(`PageHeader component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'PageHeader component', pageHeader);

  assertNoOverRoundedUsage(failures, 'PageHeader component', pageHeader);

  for (const requiredText of [
    '.zdp-stack',
    'as:',
    'gap:',
    'align:',
    'aria-labelledby={labelledBy ?? undefined}',
    'display: grid',
    'gap: var(--zdp-space-4)',
    'min-width: 0',
    '.zdp-stack--gap-md',
    '.zdp-stack--align-start'
  ]) {
    if (!stack.includes(requiredText)) {
      failures.push(`Stack component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Stack component', stack);

  assertNoOverRoundedUsage(failures, 'Stack component', stack);

  for (const requiredText of [
    '.zdp-inline',
    'as:',
    'gap:',
    'align:',
    'justify:',
    "as === 'div' && labelledBy ? 'group' : undefined",
    'role={labelledGroupRole}',
    'aria-labelledby={labelledBy ?? undefined}',
    'display: flex',
    'flex-wrap: wrap',
    'gap: var(--zdp-space-3)',
    'min-width: 0',
    '.zdp-inline--gap-sm',
    '.zdp-inline--align-center',
    '.zdp-inline--justify-start'
  ]) {
    if (!inline.includes(requiredText)) {
      failures.push(`Inline component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Inline component', inline);

  assertNoOverRoundedUsage(failures, 'Inline component', inline);

  for (const requiredText of [
    '.zdp-grid',
    'as:',
    'columns:',
    'gap:',
    'aria-labelledby={labelledBy ?? undefined}',
    'display: grid',
    'grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
    '.zdp-grid--columns-two',
    '.zdp-grid--columns-four',
    '.zdp-grid--columns-auto',
    '.zdp-grid--gap-md',
    '@media (max-width: 64rem)',
    '@media (max-width: 42rem)'
  ]) {
    if (!grid.includes(requiredText)) {
      failures.push(`Grid component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Grid component', grid);

  assertNoOverRoundedUsage(failures, 'Grid component', grid);

  for (const requiredText of [
    '.zdp-toolbar',
    'as:',
    'gap:',
    'align:',
    'aria-labelledby={labelledBy ?? undefined}',
    'class="zdp-toolbar__main"',
    'slot name="actions"',
    'class="zdp-toolbar__actions"',
    'display: flex',
    'flex-wrap: wrap',
    'justify-content: space-between',
    '.zdp-toolbar--gap-md',
    '.zdp-toolbar--align-center',
    '.zdp-toolbar__main',
    '.zdp-toolbar__actions',
    '@media (max-width: 42rem)'
  ]) {
    if (!toolbar.includes(requiredText)) {
      failures.push(`Toolbar component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Toolbar component', toolbar);

  assertNoOverRoundedUsage(failures, 'Toolbar component', toolbar);

  for (const requiredText of [
    '.zdp-divider',
    'orientation:',
    'tone:',
    'decorative = true',
    "role={decorative ? 'presentation' : 'separator'}",
    'aria-orientation={decorative ? undefined : orientation}',
    '.zdp-divider--horizontal',
    '.zdp-divider--vertical',
    '.zdp-divider--subtle',
    '.zdp-divider--strong',
    'border-block-start: 1px solid var(--zdp-color-line-subtle)',
    'border-inline-start: 1px solid var(--zdp-color-line-subtle)'
  ]) {
    if (!divider.includes(requiredText)) {
      failures.push(`Divider component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Divider component', divider);

  assertNoOverRoundedUsage(failures, 'Divider component', divider);

  for (const requiredText of [
    '.zdp-table-wrap',
    'caption:',
    'captionMode:',
    'density:',
    'aria-labelledby={labelledBy ?? undefined}',
    '<caption class={`zdp-table__caption zdp-table__caption--${captionMode}`}>',
    '.zdp-table :global(th)',
    '.zdp-table :global(td)',
    '.zdp-table :global(thead th)',
    'overflow-x: auto',
    'overscroll-behavior-inline: contain',
    'touch-action: pan-x pan-y',
    'overflow-wrap: normal',
    'white-space: nowrap',
    'word-break: normal'
  ]) {
    if (!table.includes(requiredText)) {
      failures.push(`Table component is missing ${requiredText}.`);
    }
  }

  if (/\.zdp-table-wrap\s*\{[\s\S]{0,360}scrollbar-gutter:\s*stable;/.test(table)) {
    failures.push('Table component must not reserve a permanent scrollbar gutter beside header rows.');
  }

  assertNoDecorativeEffects(failures, 'Table component', table);

  assertNoOverRoundedUsage(failures, 'Table component', table);

  for (const requiredText of [
    "import type { ZdpSortDirection }",
    "direction: ZdpSortDirection = 'none'",
    'onSort:',
    'nextDirection',
    'aria-label={resolvedAriaLabel}',
    'data-sort-direction={normalizedDirection}',
    'class="zdp-sort-header__label"',
    'class="zdp-sort-header__mark"',
    '.zdp-sort-header__mark::before',
    '.zdp-sort-header--ascending .zdp-sort-header__mark::before',
    '.zdp-sort-header--descending .zdp-sort-header__mark::before',
    '.zdp-sort-header',
    '.zdp-sort-header:hover:not(:disabled)',
    '.zdp-sort-header:focus-visible',
    '.zdp-sort-header--ascending .zdp-sort-header__mark'
  ]) {
    if (!sortHeader.includes(requiredText)) {
      failures.push(`SortHeader component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'SortHeader component', sortHeader);

  assertNoOverRoundedUsage(failures, 'SortHeader component', sortHeader);

  for (const requiredText of [
    "import SegmentedControl from './SegmentedControl.svelte'",
    "ZdpTableDensity",
    "ZdpTableToolbarDensityItem",
    "selectedCount: number | null = null",
    "density: ZdpTableDensity = 'default'",
    'onDensityChange:',
    'normalizeCount',
    'normalizeDensity',
    '<div',
    'class="zdp-table-toolbar"',
    'role="group"',
    'aria-labelledby={labelledBy ?? undefined}',
    'class="zdp-table-toolbar__body"',
    'class="zdp-table-toolbar__controls"',
    'class="zdp-table-toolbar__actions"',
    'class="zdp-table-toolbar__density"',
    '<SegmentedControl',
    '.zdp-table-toolbar',
    'display: flex',
    'flex-wrap: wrap',
    'justify-content: space-between',
    'flex: 1 1 16rem',
    'min-inline-size: min(100%, 16rem)',
    '.zdp-table-toolbar__actions',
    'margin-inline-start: auto',
    '@media (max-width: 48rem)'
  ]) {
    if (!tableToolbar.includes(requiredText)) {
      failures.push(`TableToolbar component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'TableToolbar component', tableToolbar);

  assertNoOverRoundedUsage(failures, 'TableToolbar component', tableToolbar);

  for (const requiredText of [
    '.zdp-key-value',
    'columns:',
    'density:',
    'aria-labelledby={labelledBy ?? undefined}',
    '.zdp-key-value :global(dt)',
    '.zdp-key-value :global(dd)',
    'grid-template-columns: minmax(10rem, 0.42fr) minmax(0, 1fr)',
    '@media (max-width: 42rem)',
    'overflow-wrap: var(--zdp-i18n-overflow-wrap)'
  ]) {
    if (!keyValue.includes(requiredText)) {
      failures.push(`KeyValue component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'KeyValue component', keyValue);

  assertNoOverRoundedUsage(failures, 'KeyValue component', keyValue);

  for (const requiredText of [
    '.zdp-empty-state',
    'align:',
    'tone:',
    'aria-labelledby={labelledBy ?? undefined}',
    'class="zdp-empty-state__body"',
    'slot name="actions"',
    '.zdp-empty-state__actions',
    'flex-wrap: wrap',
    'text-align: center'
  ]) {
    if (!emptyState.includes(requiredText)) {
      failures.push(`EmptyState component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'EmptyState component', emptyState);

  assertNoOverRoundedUsage(failures, 'EmptyState component', emptyState);

  for (const requiredText of [
    'interface BreadcrumbItem',
    'readonly href?: string',
    'readonly current?: boolean',
    'explicitCurrentIndex = items.findIndex',
    'resolvedCurrentIndex = explicitCurrentIndex >= 0 ? explicitCurrentIndex : items.length - 1',
    'current: index === resolvedCurrentIndex',
    '<nav class="zdp-breadcrumb" aria-label={ariaLabel}>',
    '<ol class="zdp-breadcrumb__list">',
    'class="zdp-breadcrumb__item"',
    'class="zdp-breadcrumb__separator"',
    'aria-hidden="true"',
    'class="zdp-breadcrumb__link"',
    'href={item.href}',
    'class="zdp-breadcrumb__current"',
    "aria-current={item.current ? 'page' : undefined}",
    '.zdp-breadcrumb__link:focus-visible',
    'background: var(--zdp-color-focus-surface)',
    'border-bottom-color: var(--zdp-color-focus-line)',
    'color: var(--zdp-color-focus-text)'
  ]) {
    if (!breadcrumb.includes(requiredText)) {
      failures.push(`Breadcrumb component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Breadcrumb component', breadcrumb);

  assertNoOverRoundedUsage(failures, 'Breadcrumb component', breadcrumb);

  for (const requiredText of [
    "import type { ZdpPaginationItem }",
    'export let currentPage = 1',
    'export let totalPages = 1',
    'export let siblingCount = 1',
    "export let ariaLabel = 'Pagination'",
    "export let previousLabel = 'Previous'",
    "export let nextLabel = 'Next'",
    'pageLabel: (page: number) => string = (page) => `${page} page`',
    'currentLabel: (page: number) => string = (page) => `Current page, page ${page}`',
    'hrefForPage: ((page: number) => string | null) | null = null',
    'onPageChange: ((event: MouseEvent, page: number) => void) | null = null',
    'normalizePositiveInteger',
    'clampPage',
    'clampSiblingCount',
    'buildPaginationItems',
    '<nav class="zdp-pagination" aria-label={ariaLabel}>',
    '<ol class="zdp-pagination__list">',
    'class="zdp-pagination__item"',
    'class="zdp-pagination__link zdp-pagination__link--control"',
    'class="zdp-pagination__link"',
    'class="zdp-pagination__ellipsis"',
    'aria-current={item.page === activePage ? \'page\' : undefined}',
    'disabled={item.page === activePage}',
    '.zdp-pagination',
    '.zdp-pagination__list',
    '.zdp-pagination__item',
    '.zdp-pagination__link',
    '.zdp-pagination__link--control',
    'overflow-x: auto',
    'overscroll-behavior-inline: contain',
    '--zdp-pagination-focus-bleed',
    'padding-block: var(--zdp-pagination-focus-bleed)',
    'padding-inline: var(--zdp-pagination-focus-bleed)',
    'scrollbar-gutter: stable',
    'scroll-padding-inline: var(--zdp-pagination-focus-bleed)',
    'touch-action: pan-x pan-y',
    'flex-wrap: nowrap',
    'width: max-content',
    'flex: 0 0 auto',
    'white-space: nowrap',
    '.zdp-pagination__link:focus-visible',
    '.zdp-pagination__link[aria-current=\'page\']',
    '.zdp-pagination__link:disabled',
    '.zdp-pagination__ellipsis'
  ]) {
    if (!pagination.includes(requiredText)) {
      failures.push(`Pagination component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'Pagination component', pagination);

  assertNoOverRoundedUsage(failures, 'Pagination component', pagination);

  for (const requiredText of [
    'export let size: \'sm\' | \'md\' = \'md\'',
    'export let label: string | null = null',
    'role={label ? \'img\' : undefined}',
    'aria-hidden={label ? undefined : \'true\'}',
    '.zdp-icon--sm',
    '.zdp-icon--md',
    'font-size: var(--zdp-control-glyph-md)',
    'align-items: center',
    'justify-content: center',
    'line-height: 1',
    'text-align: center'
  ]) {
    if (!icon.includes(requiredText)) {
    failures.push(`Icon component is missing centered glyph contract ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'zdpShareIcons',
    'ZdpShareDockItem',
    "import Tooltip from './Tooltip.svelte'",
    "placement: 'side' | 'rail' | 'bottom' | 'inline' = 'side'",
    'tooltipPlacement',
    'class={`zdp-share-dock zdp-share-dock--${placement}`}',
    'class="zdp-share-dock__list"',
    '<Tooltip text={item.label} placement={tooltipPlacement}',
    'disabled={item.disabled}',
    'class="zdp-share-action"',
    'class="zdp-share-action__mark"',
    'class={`zdp-share-icon zdp-share-icon--${item.icon}`}',
    'aria-label={item.ariaLabel ?? item.label}',
    'data-share-id={item.id}',
    '.zdp-share-dock--side',
    '.zdp-share-dock--rail',
    '.zdp-share-dock--bottom',
    '.zdp-share-dock--inline',
    '.zdp-share-action:hover:not(:disabled)',
    '.zdp-share-action:focus-visible',
    'outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface)',
    'max-inline-size: calc(var(--zdp-viewport-inline) - var(--zdp-space-6))'
  ]) {
    if (!shareDock.includes(requiredText)) {
      failures.push(`ShareDock component is missing ${requiredText}.`);
    }
  }

  assertNoDecorativeEffects(failures, 'ShareDock component', shareDock);

  assertNoOverRoundedUsage(failures, 'ShareDock component', shareDock);
}
