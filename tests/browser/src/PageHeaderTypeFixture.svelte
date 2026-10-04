<script lang="ts">
  import PageHeader from '../../../src/lib/components/PageHeader.svelte';
</script>

<section data-testid="page-header-type">
  <PageHeader>
    <h1 data-testid="component-title">Account settings</h1>
    <p slot="summary">Manage your profile.</p>
  </PageHeader>
  <div class="zdp-page-header">
    <div class="zdp-page-header__body">
      <div class="zdp-page-header__title"><h2 data-testid="css-title">Account settings</h2></div>
      <div class="zdp-page-header__summary"><p>Manage your profile.</p></div>
    </div>
  </div>
  <div class="consumer-title">
    <PageHeader><h2 data-testid="consumer-title">Custom section title</h2></PageHeader>
  </div>
</section>

<style>
  .consumer-title h2 {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.5;
  }
</style>
