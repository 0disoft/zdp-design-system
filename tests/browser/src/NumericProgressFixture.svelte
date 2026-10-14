<script lang="ts">
  import Progress from '../../../src/lib/components/Progress.svelte';
  import Spinner from '../../../src/lib/components/Spinner.svelte';
</script>

<section data-testid="numeric-progress-fixture">
  {#each [-Number.MAX_VALUE, 0, Number.MAX_VALUE] as value, index}
    <div data-testid={`numeric-progress-${index}`}>
      <Progress min={-Number.MAX_VALUE} max={Number.MAX_VALUE} {value} ariaLabel={`Range position ${index}`} />
    </div>
  {/each}
  <Progress ariaLabel="Waiting progress" />
  <div data-testid="spinner-motion-fixture">
    {#each ['sm', 'md', 'lg'] as size}
      <Spinner size={size as 'sm' | 'md' | 'lg'} label={`Spinner ${size}`} />
    {/each}
  </div>
</section>
