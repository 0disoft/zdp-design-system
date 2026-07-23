<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Button,
    Card,
    CardHeader,
    InlineCode,
    ResizableSplitPane,
    Tooltip,
    createZdpSplitPaneController,
    createZdpSplitPaneSizePersistence,
    zdpTokenNames,
    type ZdpTokenName
  } from 'zdp-design-system';
  import { zdpShareIcons } from 'zdp-design-system/share';
  import tokens from 'zdp-design-system/tokens';
  import 'zdp-design-system/styles.css';

  const firstToken: ZdpTokenName = zdpTokenNames[0];
  const iconCount = Object.keys(zdpShareIcons).length;
  const tokenVersion = tokens.version;
  const splitPanePersistence = createZdpSplitPaneSizePersistence({ key: 'consumer-fixture-navigation' });
  let splitPaneSize = 280;
  let staticSplitPaneRoot: HTMLElement | null = null;
  let staticSplitPanePrimary: HTMLElement | null = null;
  let staticSplitPaneSeparator: HTMLElement | null = null;
  let staticSplitPaneSecondary: HTMLElement | null = null;

  onMount(() => {
    splitPaneSize = splitPanePersistence.load();
  });

  onMount(() => {
    if (!staticSplitPaneRoot || !staticSplitPanePrimary || !staticSplitPaneSeparator || !staticSplitPaneSecondary) {
      return;
    }

    const controller = createZdpSplitPaneController(
      {
        root: staticSplitPaneRoot,
        primary: staticSplitPanePrimary,
        separator: staticSplitPaneSeparator,
        secondary: staticSplitPaneSecondary
      },
      {
        ariaLabel: 'Static navigation width',
        secondaryMinSize: 320
      }
    );

    return () => controller.destroy();
  });
</script>

<main class="zdp-surface-reset consumer-fixture">
  <Card as="section" ariaLabelledBy="consumer-card-title" hover>
    <svelte:fragment slot="header">
      <CardHeader id="consumer-card-title">Package surface</CardHeader>
    </svelte:fragment>

    <Tooltip text="패키지 export 확인" let:describedBy>
      <Button ariaDescribedBy={describedBy}>확인</Button>
    </Tooltip>

    <p>
      <InlineCode>{firstToken}</InlineCode>
      <span>{tokenVersion}</span>
      <span>{iconCount}</span>
    </p>
  </Card>

  <ResizableSplitPane
    bind:size={splitPaneSize}
    ariaLabel="Navigation width"
    getValueText={(size) => `${size} pixels`}
    onResizeCommit={(size) => splitPanePersistence.save(size)}
  >
    {#snippet primary()}
      <nav class="consumer-fixture__navigation" aria-label="Documentation">
        <a href="#consumer-overview">Overview</a>
        <a href="#consumer-contract">Consumer contract</a>
      </nav>
    {/snippet}
    <section class="consumer-fixture__document" aria-labelledby="consumer-overview">
      <h2 id="consumer-overview">Overview</h2>
      <p id="consumer-contract">Resize the navigation to match your workspace.</p>
    </section>
  </ResizableSplitPane>

  <div bind:this={staticSplitPaneRoot}>
    <nav bind:this={staticSplitPanePrimary} aria-label="Static documentation">
      <a href="#static-consumer-overview">Static overview</a>
    </nav>
    <div bind:this={staticSplitPaneSeparator}></div>
    <section bind:this={staticSplitPaneSecondary} aria-labelledby="static-consumer-overview">
      <h2 id="static-consumer-overview">Static DOM controller</h2>
      <p>The same package contract works without the Svelte component wrapper.</p>
    </section>
  </div>
</main>

<style>
  .consumer-fixture {
    display: grid;
    gap: var(--zdp-space-6);
    min-block-size: var(--zdp-viewport-block);
    padding: var(--zdp-space-6);
  }

  .consumer-fixture > :global(.zdp-resizable-split-pane) {
    block-size: 24rem;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
  }

  .consumer-fixture__navigation,
  .consumer-fixture__document {
    box-sizing: border-box;
    padding: var(--zdp-space-5);
  }

  .consumer-fixture__navigation {
    display: grid;
    gap: var(--zdp-space-3);
  }
</style>
