<script lang="ts">
  import Button from '../../../src/lib/components/Button.svelte';

  let loading = false;
  let clicks = 0;
  let submissions = 0;
  let resets = 0;
  const variants = ['primary', 'secondary', 'danger', 'text'] as const;
  const sizes = ['sm', 'md'] as const;
</script>

<section data-testid="button-loading-fixture" data-zdp-theme="light" aria-label="Loading actions">
  <button type="button" data-testid="button-loading-toggle" onclick={() => loading = !loading}>Toggle busy</button>
  <div data-testid="button-loading-variants" style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px">
    {#each variants as variant}
      {#each sizes as size}
        <Button {variant} {size} {loading} onclick={() => clicks += 1}>Save {variant} {size}</Button>
      {/each}
    {/each}
  </div>
  <Button disabled {loading}>Unavailable action</Button>
  <Button>Unchanged action</Button>
  <form
    onsubmit={(event) => { event.preventDefault(); submissions += 1; loading = true; }}
    onreset={() => resets += 1}
  >
    <input aria-label="Loading form value" name="value" value="initial" />
    <Button type="submit" {loading} onclick={() => clicks += 1}>Save form</Button>
    <Button type="reset" {loading}>Reset form</Button>
  </form>
  <output data-testid="button-loading-clicks">{clicks}</output>
  <output data-testid="button-loading-submissions">{submissions}</output>
  <output data-testid="button-loading-resets">{resets}</output>
</section>
