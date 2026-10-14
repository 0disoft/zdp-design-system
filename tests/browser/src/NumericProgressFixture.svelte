<script lang="ts">
  import Progress from '../../../src/lib/components/Progress.svelte';
  import Spinner from '../../../src/lib/components/Spinner.svelte';
  import Skeleton from '../../../src/lib/components/Skeleton.svelte';

  const skeletonVariants = ['text', 'block', 'avatar'] as const;
  let skeletonAnimated = true;
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
  <button data-testid="skeleton-motion-toggle" tabindex="-1" onclick={() => (skeletonAnimated = !skeletonAnimated)}>Toggle skeleton animation</button>
  <div data-testid="skeleton-motion-animated">
    {#each skeletonVariants as variant}
      <Skeleton {variant} lines={3} animated={skeletonAnimated} />
    {/each}
  </div>
  <div data-testid="skeleton-motion-static">
    {#each skeletonVariants as variant}
      <Skeleton {variant} lines={3} animated={false} />
    {/each}
  </div>
</section>
