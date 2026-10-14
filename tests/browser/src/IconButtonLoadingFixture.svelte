<script lang="ts">
  import IconButton from '../../../src/lib/components/IconButton.svelte';

  let loading = false;
  let clicks = 0;
  let submissions = 0;
  let resets = 0;
  const variants = ['ghost', 'solid'] as const;
  const sizes = ['sm', 'md'] as const;
</script>

<section data-testid="icon-button-loading-fixture" data-zdp-theme="light" aria-label="Loading icon actions">
  <button type="button" data-testid="icon-button-loading-toggle" onclick={() => loading = !loading}>Toggle busy icons</button>
  <div data-testid="icon-button-loading-variants" style="display:flex;flex-wrap:wrap;gap:12px;padding:12px">
    {#each variants as variant}
      {#each sizes as size}
        <IconButton {variant} {size} {loading} ariaLabel={`Save ${variant} ${size}`} title={`Action ${variant} ${size}`} ariaPressed={true} onclick={() => clicks += 1}>+</IconButton>
      {/each}
    {/each}
  </div>
  <IconButton disabled {loading} ariaLabel="Unavailable action">+</IconButton>
  <IconButton ariaLabel="Unchanged action">+</IconButton>
  <form
    onsubmit={(event) => { event.preventDefault(); submissions += 1; loading = true; }}
    onreset={() => resets += 1}
  >
    <input aria-label="Loading form value" name="value" value="initial" />
    <IconButton type="submit" {loading} ariaLabel="Save form" onclick={() => clicks += 1}>+</IconButton>
    <IconButton type="reset" {loading} ariaLabel="Reset form">−</IconButton>
  </form>
  <output data-testid="icon-button-loading-clicks">{clicks}</output>
  <output data-testid="icon-button-loading-submissions">{submissions}</output>
  <output data-testid="icon-button-loading-resets">{resets}</output>
</section>
