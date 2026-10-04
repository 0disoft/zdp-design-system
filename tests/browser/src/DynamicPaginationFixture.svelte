<script lang="ts">
  import Pagination from '../../../src/lib/components/Pagination.svelte';
  let hrefForPage: ((page: number) => string | null) | null = (page) => `/en/list?page=${page}`;
  let pageLabel = (page: number) => `Page ${page}`;
  let currentLabel = (page: number) => `Selected page ${page}`;
  let clickedPage = 0;
  let currentPage = 4;
  let totalPages = 10;
  let siblingCount = 1;
  function changeLinks(): void {
    hrefForPage = (page) => `/ko/list?page=${page}`;
    pageLabel = (page) => `Updated page ${page}`;
    currentLabel = (page) => `Updated selected page ${page}`;
  }
</script>

<section data-testid="dynamic-pagination">
  <Pagination {currentPage} {totalPages} {siblingCount} {hrefForPage} {pageLabel} {currentLabel} onPageChange={(event, page) => { event.preventDefault(); clickedPage = page; }} />
  <button type="button" data-testid="pagination-update-links" onclick={changeLinks}>Update pagination links</button>
  <button type="button" data-testid="pagination-remove-links" onclick={() => hrefForPage = null}>Use pagination buttons</button>
  <output data-testid="pagination-clicked-page">{clickedPage}</output>
  <button type="button" data-testid="pagination-safe-limit" onclick={() => { currentPage = totalPages = Number.MAX_SAFE_INTEGER; siblingCount = 3; }}>Use safe integer limit</button>
  <button type="button" data-testid="pagination-finite-limit" onclick={() => { currentPage = totalPages = Number.MAX_VALUE; siblingCount = Number.MAX_VALUE; }}>Use finite number limit</button>
  <button type="button" data-testid="pagination-invalid-range" onclick={() => { currentPage = totalPages = Number.NaN; }}>Use invalid page range</button>
  <button type="button" data-testid="pagination-normal-range" onclick={() => { currentPage = 4; totalPages = 10; siblingCount = 1; }}>Restore page range</button>
</section>
