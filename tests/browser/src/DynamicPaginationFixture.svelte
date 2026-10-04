<script lang="ts">
  import Pagination from '../../../src/lib/components/Pagination.svelte';
  let hrefForPage: ((page: number) => string | null) | null = (page) => `/en/list?page=${page}`;
  let pageLabel = (page: number) => `Page ${page}`;
  let currentLabel = (page: number) => `Selected page ${page}`;
  let clickedPage = 0;
  function changeLinks(): void {
    hrefForPage = (page) => `/ko/list?page=${page}`;
    pageLabel = (page) => `Updated page ${page}`;
    currentLabel = (page) => `Updated selected page ${page}`;
  }
</script>

<section data-testid="dynamic-pagination">
  <Pagination currentPage={4} totalPages={10} {hrefForPage} {pageLabel} {currentLabel} onPageChange={(event, page) => { event.preventDefault(); clickedPage = page; }} />
  <button type="button" data-testid="pagination-update-links" onclick={changeLinks}>Update pagination links</button>
  <button type="button" data-testid="pagination-remove-links" onclick={() => hrefForPage = null}>Use pagination buttons</button>
  <output data-testid="pagination-clicked-page">{clickedPage}</output>
</section>
