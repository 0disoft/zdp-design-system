<script lang="ts">
  import Container from '../../../src/lib/components/Container.svelte';
</script>

<main class="page-gutter-fixture zdp-surface-reset">
  <section data-testid="svelte-page-gutter-host" aria-label="Svelte page gutter">
    <Container size="lg" gutter="page">
      <p class="page-gutter-fixture__copy">
        출시 전 국제화 검토에서 길어진 한국어 안내와 exceptionallylongunbrokenlocalizedidentifierthatmustnotwidendthepageshell를 함께 확인합니다.
      </p>
    </Container>
  </section>

  <section
    class="zdp-container zdp-container--lg zdp-container--padding-page"
    data-testid="static-page-gutter"
    aria-label="Static page gutter"
  >
    <p class="page-gutter-fixture__copy">
      نتحقق من بقاء المساحة المنطقية حول محتوى الصفحة الطويل عند الاتجاه من اليمين إلى اليسار دون تمرير أفقي.
    </p>
  </section>

  <section data-testid="nested-container-host" aria-label="Nested container padding">
    <Container size="full" padding="md">
      <p class="page-gutter-fixture__copy">Nested containers retain the existing medium padding contract.</p>
    </Container>
  </section>
</main>

<style>
  :global(html),
  :global(body),
  :global(#app) {
    margin: 0;
    min-inline-size: 0;
  }

  .page-gutter-fixture {
    min-inline-size: 0;
  }

  .page-gutter-fixture__copy {
    margin: 0;
    overflow-wrap: anywhere;
  }
</style>
