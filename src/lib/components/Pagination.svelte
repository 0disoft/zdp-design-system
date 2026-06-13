<script lang="ts">
  import type { ZdpPaginationItem } from '../pagination';

  type ZdpPaginationRenderItem =
    | (Extract<ZdpPaginationItem, { readonly type: 'page' }> & {
        readonly href: string | null;
      })
    | Extract<ZdpPaginationItem, { readonly type: 'ellipsis' }>;

  export let currentPage = 1;
  export let totalPages = 1;
  export let siblingCount = 1;
  export let ariaLabel = '페이지 이동';
  export let previousLabel = '이전';
  export let nextLabel = '다음';
  export let pageLabel: (page: number) => string = (page) => `${page}페이지`;
  export let currentLabel: (page: number) => string = (page) => `현재 ${page}페이지`;
  export let hrefForPage: ((page: number) => string | null) | null = null;
  export let onPageChange: ((event: MouseEvent, page: number) => void) | null = null;

  $: normalizedTotalPages = normalizePositiveInteger(totalPages);
  $: activePage = clampPage(currentPage, normalizedTotalPages);
  $: safeSiblingCount = clampSiblingCount(siblingCount);
  $: paginationItems = toRenderItems(
    buildPaginationItems(activePage, normalizedTotalPages, safeSiblingCount)
  );
  $: previousPage = Math.max(1, activePage - 1);
  $: nextPage = Math.min(normalizedTotalPages, activePage + 1);
  $: previousHref = activePage > 1 ? hrefFor(previousPage) : null;
  $: nextHref = activePage < normalizedTotalPages ? hrefFor(nextPage) : null;
  $: hasPrevious = activePage > 1;
  $: hasNext = activePage < normalizedTotalPages;

  function normalizeInteger(value: number, fallback: number): number {
    return Number.isFinite(value) ? Math.floor(value) : fallback;
  }

  function normalizePositiveInteger(value: number): number {
    return Math.max(1, normalizeInteger(value, 1));
  }

  function clampPage(value: number, total: number): number {
    return Math.min(total, Math.max(1, normalizeInteger(value, 1)));
  }

  function clampSiblingCount(value: number): number {
    return Math.min(3, Math.max(0, normalizeInteger(value, 1)));
  }

  function hrefFor(page: number): string | null {
    return hrefForPage?.(page) ?? null;
  }

  function toRenderItems(items: readonly ZdpPaginationItem[]): readonly ZdpPaginationRenderItem[] {
    return items.map((item) => (item.type === 'page' ? { ...item, href: hrefFor(item.page) } : item));
  }

  function buildPaginationItems(
    current: number,
    total: number,
    siblings: number
  ): readonly ZdpPaginationItem[] {
    const pages = new Set<number>([1, total]);

    for (let page = current - siblings; page <= current + siblings; page += 1) {
      if (page >= 1 && page <= total) {
        pages.add(page);
      }
    }

    const sortedPages = [...pages].sort((left, right) => left - right);
    const items: ZdpPaginationItem[] = [];
    let previousPageNumber = 0;

    for (const page of sortedPages) {
      if (previousPageNumber > 0 && page - previousPageNumber > 1) {
        if (page - previousPageNumber === 2) {
          const adjacentPage = previousPageNumber + 1;
          items.push({
            type: 'page',
            page: adjacentPage,
            key: `page-${adjacentPage}`
          });
        } else {
          items.push({
            type: 'ellipsis',
            key: `ellipsis-${previousPageNumber}-${page}`
          });
        }
      }

      items.push({
        type: 'page',
        page,
        key: `page-${page}`
      });
      previousPageNumber = page;
    }

    return items;
  }

  function handlePageClick(event: MouseEvent, page: number): void {
    onPageChange?.(event, page);
  }

  function labelForPage(page: number): string {
    return page === activePage ? currentLabel(page) : pageLabel(page);
  }
</script>

<nav class="zdp-pagination" aria-label={ariaLabel}>
  <ol class="zdp-pagination__list">
    <li class="zdp-pagination__item">
      {#if previousHref}
        <a
          class="zdp-pagination__link zdp-pagination__link--control"
          href={previousHref}
          aria-label={previousLabel}
          onclick={(event) => handlePageClick(event, previousPage)}
        >
          {previousLabel}
        </a>
      {:else}
        <button
          class="zdp-pagination__link zdp-pagination__link--control"
          type="button"
          aria-label={previousLabel}
          disabled={!hasPrevious}
          onclick={(event) => handlePageClick(event, previousPage)}
        >
          {previousLabel}
        </button>
      {/if}
    </li>

    {#each paginationItems as item (item.key)}
      <li class="zdp-pagination__item">
        {#if item.type === 'ellipsis'}
          <span class="zdp-pagination__ellipsis" aria-hidden="true">...</span>
        {:else if item.href && item.page !== activePage}
          <a
            class="zdp-pagination__link"
            href={item.href}
            aria-label={labelForPage(item.page)}
            aria-current={item.page === activePage ? 'page' : undefined}
            onclick={(event) => handlePageClick(event, item.page)}
          >
            {item.page}
          </a>
        {:else}
          <button
            class="zdp-pagination__link"
            type="button"
            aria-label={labelForPage(item.page)}
            aria-current={item.page === activePage ? 'page' : undefined}
            disabled={item.page === activePage}
            onclick={(event) => handlePageClick(event, item.page)}
          >
            {item.page}
          </button>
        {/if}
      </li>
    {/each}

    <li class="zdp-pagination__item">
      {#if nextHref}
        <a
          class="zdp-pagination__link zdp-pagination__link--control"
          href={nextHref}
          aria-label={nextLabel}
          onclick={(event) => handlePageClick(event, nextPage)}
        >
          {nextLabel}
        </a>
      {:else}
        <button
          class="zdp-pagination__link zdp-pagination__link--control"
          type="button"
          aria-label={nextLabel}
          disabled={!hasNext}
          onclick={(event) => handlePageClick(event, nextPage)}
        >
          {nextLabel}
        </button>
      {/if}
    </li>
  </ol>
</nav>

<style>
  .zdp-pagination {
    --zdp-pagination-focus-bleed: calc(var(--zdp-control-focus-outline-width) + var(--zdp-control-focus-outline-offset));

    color: var(--zdp-color-ink-normal);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    line-height: var(--zdp-type-control-line-height);
    max-width: 100%;
    min-width: 0;
    overscroll-behavior-inline: contain;
    overflow-x: auto;
    padding-block: var(--zdp-pagination-focus-bleed);
    padding-inline: var(--zdp-pagination-focus-bleed);
    scrollbar-gutter: stable;
    scroll-padding-inline: var(--zdp-pagination-focus-bleed);
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }

  .zdp-pagination__list {
    align-items: center;
    display: flex;
    flex-wrap: nowrap;
    gap: var(--zdp-space-2);
    list-style: none;
    margin: 0;
    min-width: 0;
    padding: 0;
    width: max-content;
  }

  .zdp-pagination__item {
    display: inline-flex;
    flex: 0 0 auto;
    min-width: 0;
  }

  .zdp-pagination__link,
  .zdp-pagination__ellipsis {
    align-items: center;
    border: var(--zdp-control-border-width) solid transparent;
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: var(--zdp-type-control-line-height);
    min-block-size: var(--zdp-control-height-sm);
    min-inline-size: var(--zdp-control-height-sm);
    padding: var(--zdp-space-1) var(--zdp-space-2);
    text-align: center;
    white-space: nowrap;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-pagination__link {
    background: var(--zdp-color-surface-panel);
    border-color: var(--zdp-color-line-subtle);
    color: var(--zdp-color-ink-normal);
    cursor: pointer;
    text-decoration-line: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-pagination__link--control {
    padding-inline: var(--zdp-space-3);
  }

  .zdp-pagination__link:hover:not(:disabled):not([aria-current='page']) {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-pagination__link:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-pagination__link[aria-current='page'] {
    background: var(--zdp-color-accent-primary-soft);
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-strong);
    cursor: default;
  }

  .zdp-pagination__link:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-pagination__link[aria-current='page']:disabled {
    opacity: 1;
  }

  .zdp-pagination__ellipsis {
    color: var(--zdp-color-ink-muted);
  }
</style>
