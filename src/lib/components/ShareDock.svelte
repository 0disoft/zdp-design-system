<script lang="ts">
  import { zdpShareIcons, type ZdpShareDockItem } from '../share.ts';

  export let items: readonly ZdpShareDockItem[] = [];
  export let ariaLabel = '공유';
  export let labelledBy: string | null = null;
  export let placement: 'side' | 'rail' | 'bottom' | 'inline' = 'side';

  function handleClick(event: MouseEvent, item: ZdpShareDockItem): void {
    item.onclick?.(event, item);
  }

  function resolvedRel(item: ZdpShareDockItem): string | undefined {
    if (item.rel) {
      return item.rel;
    }

    return item.target === '_blank' ? 'noopener noreferrer' : undefined;
  }
</script>

<aside
  class={`zdp-share-dock zdp-share-dock--${placement}`}
  aria-label={labelledBy ? undefined : ariaLabel}
  aria-labelledby={labelledBy ?? undefined}
>
  <div class="zdp-share-dock__list">
    {#each items as item (item.id)}
      {@const icon = zdpShareIcons[item.icon]}
      {#if item.href}
        <a
          class="zdp-share-action"
          href={item.href}
          target={item.target ?? undefined}
          rel={resolvedRel(item)}
          aria-label={item.ariaLabel ?? item.label}
          data-share-id={item.id}
          onclick={(event) => handleClick(event, item)}
        >
          <span class="zdp-share-action__mark" aria-hidden="true">
            <svg class={`zdp-share-icon zdp-share-icon--${item.icon}`} viewBox={icon.viewBox} focusable="false">
              {#each icon.lines ?? [] as line}
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width={line.strokeWidth ?? '2'}
                />
              {/each}
              {#each icon.paths ?? [] as path}
                <path
                  d={path.d}
                  fill={path.fill === false ? 'none' : 'currentColor'}
                  stroke={path.stroke ? 'currentColor' : undefined}
                  stroke-linecap={path.strokeLinecap}
                  stroke-linejoin={path.strokeLinejoin}
                  stroke-width={path.strokeWidth}
                />
              {/each}
              {#each icon.circles ?? [] as circle}
                <circle
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r}
                  fill={circle.fill === false || circle.stroke ? 'none' : 'currentColor'}
                  stroke={circle.stroke ? 'currentColor' : undefined}
                  stroke-width={circle.strokeWidth}
                />
              {/each}
            </svg>
          </span>
          <span class="zdp-share-action__tooltip" aria-hidden="true">{item.label}</span>
        </a>
      {:else}
        <button
          class="zdp-share-action"
          type="button"
          disabled={item.disabled}
          aria-label={item.ariaLabel ?? item.label}
          data-share-id={item.id}
          onclick={(event) => handleClick(event, item)}
        >
          <span class="zdp-share-action__mark" aria-hidden="true">
            <svg class={`zdp-share-icon zdp-share-icon--${item.icon}`} viewBox={icon.viewBox} focusable="false">
              {#each icon.lines ?? [] as line}
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width={line.strokeWidth ?? '2'}
                />
              {/each}
              {#each icon.paths ?? [] as path}
                <path
                  d={path.d}
                  fill={path.fill === false ? 'none' : 'currentColor'}
                  stroke={path.stroke ? 'currentColor' : undefined}
                  stroke-linecap={path.strokeLinecap}
                  stroke-linejoin={path.strokeLinejoin}
                  stroke-width={path.strokeWidth}
                />
              {/each}
              {#each icon.circles ?? [] as circle}
                <circle
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r}
                  fill={circle.fill === false || circle.stroke ? 'none' : 'currentColor'}
                  stroke={circle.stroke ? 'currentColor' : undefined}
                  stroke-width={circle.strokeWidth}
                />
              {/each}
            </svg>
          </span>
          <span class="zdp-share-action__tooltip" aria-hidden="true">{item.label}</span>
        </button>
      {/if}
    {/each}
  </div>
</aside>

<style>
  .zdp-share-dock {
    color: var(--zdp-color-ink-normal);
    font-family: var(--zdp-font-family-sans);
    z-index: 20;
  }

  .zdp-share-dock--side {
    position: fixed;
    right: max(var(--zdp-space-3), calc((100vw - var(--zdp-breakpoint-desktop)) / 2 + var(--zdp-space-4)));
    top: 40vh;
  }

  .zdp-share-dock--rail {
    align-self: start;
    position: sticky;
    top: var(--zdp-space-5);
  }

  .zdp-share-dock--bottom {
    bottom: var(--zdp-space-3);
    left: var(--zdp-space-3);
    position: fixed;
    right: var(--zdp-space-3);
  }

  .zdp-share-dock--inline {
    position: static;
    transform: none;
  }

  .zdp-share-dock__list {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-radius-lg);
    display: grid;
    gap: var(--zdp-space-2);
    padding: var(--zdp-space-2);
  }

  .zdp-share-dock--bottom .zdp-share-dock__list,
  .zdp-share-dock--inline .zdp-share-dock__list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .zdp-share-action {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-muted);
    cursor: pointer;
    display: inline-flex;
    height: var(--zdp-control-icon-sm);
    justify-content: center;
    position: relative;
    text-decoration-line: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
    width: var(--zdp-control-icon-sm);
  }

  .zdp-share-action:hover:not(:disabled),
  .zdp-share-action:focus-visible {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-share-action:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-share-action:disabled {
    cursor: not-allowed;
    opacity: 0.56;
  }

  .zdp-share-action__mark,
  .zdp-share-icon {
    height: var(--zdp-control-glyph-sm);
    width: var(--zdp-control-glyph-sm);
  }

  .zdp-share-action__mark {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
  }

  .zdp-share-icon {
    display: block;
    overflow: visible;
  }

  .zdp-share-action__tooltip {
    background: var(--zdp-color-ink-strong);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-radius-xs);
    color: var(--zdp-color-surface-panel);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
    opacity: 0;
    padding: var(--zdp-space-1) var(--zdp-space-2);
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
  }

  .zdp-share-dock--side .zdp-share-action__tooltip,
  .zdp-share-dock--rail .zdp-share-action__tooltip {
    right: calc(100% + var(--zdp-space-2));
    top: 0;
  }

  .zdp-share-dock--bottom .zdp-share-action__tooltip,
  .zdp-share-dock--inline .zdp-share-action__tooltip {
    bottom: calc(100% + var(--zdp-space-2));
    left: 0;
  }

  .zdp-share-action:hover .zdp-share-action__tooltip,
  .zdp-share-action:focus-visible .zdp-share-action__tooltip {
    opacity: 1;
  }

  @media (max-width: 57.5rem) {
    .zdp-share-dock--side {
      bottom: var(--zdp-space-3);
      left: var(--zdp-space-3);
      right: var(--zdp-space-3);
      top: auto;
    }

    .zdp-share-dock--side .zdp-share-dock__list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      max-inline-size: calc(100vw - var(--zdp-space-6));
    }

    .zdp-share-dock--rail .zdp-share-dock__list {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .zdp-share-dock--side .zdp-share-action__tooltip,
    .zdp-share-dock--rail .zdp-share-action__tooltip {
      bottom: calc(100% + var(--zdp-space-2));
      left: 0;
      right: auto;
      top: auto;
    }
  }

  @media (max-width: 42rem) {
    .zdp-share-dock--side,
    .zdp-share-dock--bottom {
      bottom: var(--zdp-space-2);
    }

    .zdp-share-dock__list {
      gap: var(--zdp-space-1);
      padding: var(--zdp-space-1);
    }

  }
</style>
