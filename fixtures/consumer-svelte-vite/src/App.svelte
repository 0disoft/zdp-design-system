<script lang="ts">
  import {
    Button,
    Card,
    CardHeader,
    InlineCode,
    Tooltip,
    zdpTokenNames,
    type ZdpTokenName
  } from 'zdp-design-system';
  import { zdpShareIcons } from 'zdp-design-system/share';
  import tokens from 'zdp-design-system/tokens';
  import 'zdp-design-system/styles.css';

  const firstToken: ZdpTokenName = zdpTokenNames[0];
  const iconCount = Object.keys(zdpShareIcons).length;
  const tokenVersion = tokens.version;
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
</main>

<style>
  .consumer-fixture {
    min-block-size: var(--zdp-viewport-block);
    padding: var(--zdp-space-6);
  }
</style>
