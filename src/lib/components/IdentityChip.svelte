<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { ZdpIdentityChipAriaCurrent, ZdpIdentityChipSize } from '../identity';

  export let label = 'User';
  export let description: string | null = null;
  export let initials: string | null = null;
  export let imageSrc: string | null = null;
  export let href: string | null = null;
  export let size: ZdpIdentityChipSize = 'md';
  export let selected = false;
  export let ariaLabel: string | null = null;
  export let ariaCurrent: ZdpIdentityChipAriaCurrent | null = null;

  $: chipClass = `zdp-identity-chip zdp-identity-chip--${size} ${href ? 'zdp-identity-chip--link' : ''}`;
</script>

{#if href}
  <a
    class={chipClass}
    href={href}
    aria-label={ariaLabel ?? undefined}
    aria-current={ariaCurrent ?? undefined}
    data-selected={selected ? 'true' : undefined}
  >
    <Avatar label={label} initials={initials} imageSrc={imageSrc} size={size} decorative />
    <span class="zdp-identity-chip__body">
      <span class="zdp-identity-chip__label">{label}</span>
      {#if description}
        <span class="zdp-identity-chip__description">{description}</span>
      {/if}
    </span>
  </a>
{:else}
  <span
    class={chipClass}
    role={ariaLabel ? 'group' : undefined}
    aria-label={ariaLabel ?? undefined}
    data-selected={selected ? 'true' : undefined}
  >
    <Avatar label={label} initials={initials} imageSrc={imageSrc} size={size} decorative />
    <span class="zdp-identity-chip__body">
      <span class="zdp-identity-chip__label">{label}</span>
      {#if description}
        <span class="zdp-identity-chip__description">{description}</span>
      {/if}
    </span>
  </span>
{/if}

<style>
  .zdp-identity-chip {
    align-items: center;
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    color: var(--zdp-color-ink-normal);
    display: inline-flex;
    font-family: var(--zdp-font-family-sans);
    gap: var(--zdp-space-2);
    max-width: 100%;
    min-width: 0;
    text-align: start;
    text-decoration: none;
    vertical-align: middle;
  }

  .zdp-identity-chip--sm {
    min-height: var(--zdp-control-height-md);
    padding: var(--zdp-space-1) var(--zdp-space-2);
  }

  .zdp-identity-chip--md {
    min-height: calc(var(--zdp-control-height-md) + var(--zdp-space-2));
    padding: var(--zdp-space-2) var(--zdp-space-3);
  }

  .zdp-identity-chip--link {
    cursor: pointer;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-identity-chip--link:hover {
    background: var(--zdp-color-surface-raised);
    border-color: var(--zdp-color-line-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-identity-chip--link:focus-visible {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  .zdp-identity-chip[data-selected='true'],
  .zdp-identity-chip[aria-current] {
    border-color: var(--zdp-color-accent-primary-strong);
    color: var(--zdp-color-ink-strong);
  }

  .zdp-identity-chip__body {
    display: grid;
    gap: var(--zdp-space-1);
    min-width: 0;
  }

  .zdp-identity-chip__label,
  .zdp-identity-chip__description {
    display: block;
    min-width: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .zdp-identity-chip__label {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-body-small-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-body-small-line-height);
  }

  .zdp-identity-chip__description {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-caption-size);
    line-height: var(--zdp-type-caption-line-height);
  }
</style>
