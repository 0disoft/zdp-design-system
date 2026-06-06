<script lang="ts">
  import type { ZdpAvatarSize, ZdpAvatarTone } from '../identity.ts';

  export let label: string | null = null;
  export let initials: string | null = null;
  export let imageSrc: string | null = null;
  export let size: ZdpAvatarSize = 'md';
  export let tone: ZdpAvatarTone = 'neutral';
  export let decorative = false;

  $: resolvedLabel = label?.trim() || '사용자';
  $: resolvedInitials = initials?.trim() ?? '';
  $: accessibilityLabel = decorative ? undefined : resolvedLabel;
</script>

<span
  class={`zdp-avatar zdp-avatar--${size} zdp-avatar--${tone}`}
  role={decorative ? undefined : 'img'}
  aria-label={accessibilityLabel}
  aria-hidden={decorative ? 'true' : undefined}
>
  {#if imageSrc}
    <img class="zdp-avatar__image" src={imageSrc} alt="" />
  {:else if resolvedInitials}
    <span class="zdp-avatar__initials" aria-hidden="true">{resolvedInitials}</span>
  {:else}
    <span class="zdp-avatar__initials" aria-hidden="true"></span>
  {/if}
</span>

<style>
  .zdp-avatar {
    align-items: center;
    background: var(--zdp-color-surface-raised);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: 50%;
    box-sizing: border-box;
    color: var(--zdp-color-ink-strong);
    display: inline-flex;
    flex: 0 0 auto;
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-medium);
    justify-content: center;
    line-height: 1;
    overflow: hidden;
    text-align: center;
    vertical-align: middle;
  }

  .zdp-avatar--sm {
    font-size: var(--zdp-font-size-xs);
    height: var(--zdp-control-height-sm);
    width: var(--zdp-control-height-sm);
  }

  .zdp-avatar--md {
    font-size: var(--zdp-type-caption-size);
    height: var(--zdp-control-height-md);
    width: var(--zdp-control-height-md);
  }

  .zdp-avatar--lg {
    font-size: var(--zdp-type-body-size);
    height: calc(var(--zdp-control-height-md) + var(--zdp-space-4));
    width: calc(var(--zdp-control-height-md) + var(--zdp-space-4));
  }

  .zdp-avatar--primary {
    background: var(--zdp-color-accent-primary-soft);
    border-color: var(--zdp-color-accent-primary-strong);
  }

  .zdp-avatar__image {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .zdp-avatar__initials {
    display: block;
    max-width: 100%;
    overflow: hidden;
    padding: 0 var(--zdp-space-1);
    text-overflow: ellipsis;
    -webkit-user-select: none;
    user-select: none;
    white-space: nowrap;
  }
</style>
