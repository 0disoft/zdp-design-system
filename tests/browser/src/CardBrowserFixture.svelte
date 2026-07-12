<script lang="ts">
  import Card from '../../../src/lib/components/Card.svelte';
  import CardHeader from '../../../src/lib/components/CardHeader.svelte';
  import Tooltip from '../../../src/lib/components/Tooltip.svelte';
</script>

<main class="zdp-surface-reset">
  <Card as="section" ariaLabelledBy="release-summary-title" hover>
    <svelte:fragment slot="header">
      <CardHeader id="release-summary-title">Release summary</CardHeader>
    </svelte:fragment>
    <p>The card groups content without pretending the whole surface is interactive.</p>
    <a data-testid="card-link" href="#release-details">Review release</a>
  </Card>

  <Card as="div" ariaLabel="Deployment status">
    <p>Ready</p>
  </Card>

  <Tooltip text="Keyboard help" id="browser-tooltip" let:describedBy>
    <button data-testid="tooltip-trigger" type="button" aria-describedby={describedBy ?? undefined}>Help</button>
  </Tooltip>

  <section id="release-details" aria-label="Release details">
    <p>Keyboard navigation reached the explicit link.</p>
  </section>
</main>
