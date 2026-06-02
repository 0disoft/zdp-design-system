<script lang="ts">
  export let href = '#content';
</script>

<a class="zdp-skip-link" {href}>
  <slot />
</a>

<style>
  .zdp-skip-link {
    background: var(--zdp-color-focus-surface);
    border: var(--zdp-control-border-width) solid var(--zdp-color-focus-line);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-focus-text);
    font-family: var(--zdp-font-family-sans);
    font-size: var(--zdp-type-control-size);
    font-weight: var(--zdp-font-weight-medium);
    left: var(--zdp-space-3);
    line-height: var(--zdp-type-control-line-height);
    opacity: 0;
    padding: var(--zdp-space-2) var(--zdp-space-3);
    pointer-events: none;
    position: fixed;
    text-decoration-line: none;
    top: var(--zdp-space-3);
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease,
      opacity var(--zdp-motion-fast) ease;
    z-index: 10000;
  }

  .zdp-skip-link:focus-visible {
    opacity: 1;
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
    pointer-events: auto;
  }
</style>
