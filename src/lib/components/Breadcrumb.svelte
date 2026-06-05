<script lang="ts">
  export interface BreadcrumbItem {
    readonly label: string;
    readonly href?: string;
    readonly current?: boolean;
  }

  export let items: readonly BreadcrumbItem[] = [];
  export let ariaLabel = 'Breadcrumb';

  $: normalizedItems = items.map((item, index) => ({
    ...item,
    current: item.current === true || index === items.length - 1
  }));
</script>

<nav class="zdp-breadcrumb" aria-label={ariaLabel}>
  <ol class="zdp-breadcrumb__list">
    {#each normalizedItems as item, index}
      <li class="zdp-breadcrumb__item">
        {#if index > 0}
          <span class="zdp-breadcrumb__separator" aria-hidden="true">/</span>
        {/if}

        {#if item.href && !item.current}
          <a class="zdp-breadcrumb__link" href={item.href}>{item.label}</a>
        {:else}
          <span class="zdp-breadcrumb__current" aria-current={item.current ? 'page' : undefined}>
            {item.label}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .zdp-breadcrumb {
    color: var(--zdp-color-ink-muted);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    min-width: 0;
  }

  .zdp-breadcrumb__list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    list-style: none;
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .zdp-breadcrumb__item {
    align-items: center;
    display: inline-flex;
    gap: var(--zdp-space-2);
    min-width: 0;
  }

  .zdp-breadcrumb__link {
    border-bottom: var(--zdp-control-focus-underline-width) solid transparent;
    color: var(--zdp-color-ink-normal);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    text-decoration-line: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-breadcrumb__link:hover {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-breadcrumb__link:focus-visible {
    background: var(--zdp-color-focus-surface);
    border-bottom-color: var(--zdp-color-focus-line);
    color: var(--zdp-color-focus-text);
    outline: 0;
  }

  .zdp-breadcrumb__current {
    color: var(--zdp-color-ink-strong);
    font-weight: var(--zdp-font-weight-medium);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-breadcrumb__separator {
    color: var(--zdp-color-line-strong);
    user-select: none;
  }
</style>
