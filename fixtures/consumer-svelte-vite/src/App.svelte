<script lang="ts">
  import {
    Button,
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
  <Tooltip label="패키지 export 확인">
    {#snippet trigger({ describedBy })}
      <Button ariaDescribedBy={describedBy}>확인</Button>
    {/snippet}
  </Tooltip>

  <p>
    <InlineCode>{firstToken}</InlineCode>
    <span>{tokenVersion}</span>
    <span>{iconCount}</span>
  </p>
</main>

<style>
  .consumer-fixture {
    min-height: 100vh;
    padding: var(--zdp-space-6);
  }
</style>
