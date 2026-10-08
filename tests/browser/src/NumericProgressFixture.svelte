<script lang="ts">
  import Progress from '../../../src/lib/components/Progress.svelte';
</script>

<section data-testid="numeric-progress-fixture">
  {#each [-Number.MAX_VALUE, 0, Number.MAX_VALUE] as value, index}
    <div data-testid={`numeric-progress-${index}`}>
      <Progress min={-Number.MAX_VALUE} max={Number.MAX_VALUE} {value} ariaLabel={`Range position ${index}`} />
    </div>
  {/each}
</section>
