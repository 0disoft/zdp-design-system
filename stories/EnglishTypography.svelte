<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import Input from '../src/lib/components/Input.svelte';
  import Label from '../src/lib/components/Label.svelte';
  import Table from '../src/lib/components/Table.svelte';

  const typefaces = [
    { id: 'manrope', name: 'Manrope' },
    { id: 'geist', name: 'Geist Sans' }
  ] as const;
</script>

<main class="type-comparison zdp-surface-reset" lang="en">
  <h1>English UI typography</h1>
  <div class="type-comparison__samples">
    {#each typefaces as face (face.id)}
      <section
        class="type-comparison__sample zdp-surface-reset"
        class:type-comparison__sample--geist={face.id === 'geist'}
        aria-labelledby={`typeface-${face.id}`}
        data-typeface={face.id}
      >
        <h2 id={`typeface-${face.id}`}>{face.name}</h2>
        <div class="type-comparison__content">
          <header>
            <h3>Release notifications</h3>
            <p>Send approval requests and scheduled release updates to the team managing this workspace.</p>
          </header>

          <div class="type-comparison__field">
            <Label forId={`notification-email-${face.id}`}>Notification email address</Label>
            <Input id={`notification-email-${face.id}`} type="email" value="releases@example.com" />
          </div>

          <div class="type-comparison__actions">
            <Button>Save notification preferences</Button>
            <Button variant="secondary">Cancel</Button>
          </div>

          <div class="type-comparison__table">
            <Table caption="Upcoming reviews" density="compact">
              <thead>
                <tr><th scope="col">Release</th><th scope="col">Review status</th><th scope="col">Open items</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">Production access</th><td>Pending approval</td><td>12</td></tr>
                <tr><th scope="row">Customer notifications</th><td>Ready to review</td><td>108</td></tr>
              </tbody>
            </Table>
          </div>
        </div>
      </section>
    {/each}
  </div>
</main>

<style>
  @font-face {
    font-family: "Geist Variable";
    src: url("https://cdn.jsdelivr.net/npm/@fontsource-variable/geist@5.3.0/files/geist-latin-wght-normal.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  .type-comparison {
    --type-comparison-default: var(--zdp-font-family-latin);
    display: grid;
    gap: var(--zdp-space-6);
    margin-inline: auto;
    max-inline-size: var(--zdp-breakpoint-wide);
    padding: var(--zdp-space-6);
  }

  h1, h2, h3, p {
    margin: 0;
  }

  h1 {
    font-size: var(--zdp-type-page-title-compact-size);
    line-height: var(--zdp-type-page-title-line-height);
  }

  h2 {
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
  }

  h3 {
    font-size: var(--zdp-type-body-size);
    font-weight: var(--zdp-font-weight-semibold);
    line-height: var(--zdp-font-line-height-tight);
  }

  .type-comparison__samples {
    display: grid;
    gap: var(--zdp-space-4);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 35rem), 1fr));
  }

  .type-comparison__sample {
    background: var(--zdp-color-surface-panel);
    border-radius: var(--zdp-radius-lg);
    display: grid;
    gap: var(--zdp-space-4);
    min-inline-size: 0;
    padding: var(--zdp-space-4);
  }

  .type-comparison__sample--geist {
    --zdp-font-family-latin: "Geist Variable", var(--type-comparison-default);
  }

  .type-comparison__content {
    display: grid;
    gap: var(--zdp-space-4);
    min-inline-size: 0;
  }

  header, .type-comparison__field {
    display: grid;
    gap: var(--zdp-space-2);
  }

  header p {
    color: var(--zdp-color-ink-muted);
  }

  .type-comparison__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
  }

  .type-comparison__table :global(.zdp-table) {
    min-inline-size: 0;
    table-layout: fixed;
  }

  .type-comparison__table :global(th),
  .type-comparison__table :global(td) {
    overflow-wrap: anywhere;
    padding-inline: var(--zdp-space-2);
    white-space: normal;
  }

  .type-comparison__table :global(thead th:first-child) {
    inline-size: 45%;
  }

  .type-comparison__table :global(thead th:last-child) {
    inline-size: 22%;
  }

  .type-comparison__table :global(tr > :last-child) {
    padding-inline: var(--zdp-space-1);
    text-align: end;
  }

  @media (max-width: 30rem) {
    .type-comparison {
      padding: var(--zdp-space-4);
    }
  }
</style>
