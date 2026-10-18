<script lang="ts">
  interface Props {
    href: string;
    tone?: 'primary' | 'muted';
    target?: '_self' | '_blank' | '_parent' | '_top' | undefined;
    rel?: string | undefined;
    ariaCurrent?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | true
    | false
    | undefined;
    ariaKeyShortcuts?: string | null;
  }

  let {
    href = $bindable(),
    tone = $bindable('primary'),
    target = $bindable(undefined),
    rel = $bindable(undefined),
    ariaCurrent = $bindable(undefined),
    ariaKeyShortcuts = $bindable(null)
  }: Props = $props();

  let resolvedRel = $derived(target === '_blank' ? rel ?? 'noopener noreferrer' : rel);
  let resolvedAriaCurrent =
    $derived(ariaCurrent === true ? 'true' : ariaCurrent === false ? undefined : ariaCurrent);
</script>

<a
  class={`zdp-link zdp-link--${tone}`}
  {href}
  {target}
  rel={resolvedRel}
  aria-current={resolvedAriaCurrent}
  aria-keyshortcuts={ariaKeyShortcuts ?? undefined}
>
  <!-- svelte-ignore slot_element_deprecated public slot compatibility --><slot />
</a>

<style>
  .zdp-link {
    border-bottom: var(--zdp-control-focus-underline-width) solid transparent;
    color: var(--zdp-color-ink-normal);
    font-family: var(--zdp-font-family-sans);
    font-weight: var(--zdp-font-weight-medium);
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
    text-decoration-line: none;
    transition:
      background-color var(--zdp-motion-fast) ease,
      border-color var(--zdp-motion-fast) ease,
      color var(--zdp-motion-fast) ease;
  }

  .zdp-link:hover {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-link:focus-visible {
    background: var(--zdp-color-focus-surface);
    border-bottom-color: var(--zdp-color-focus-line);
    color: var(--zdp-color-focus-text);
    outline: 0;
  }

  .zdp-link[aria-current] {
    color: var(--zdp-color-ink-strong);
  }

  .zdp-link--primary {
    color: var(--zdp-color-ink-normal);
  }

  .zdp-link--muted {
    color: var(--zdp-color-ink-muted);
  }
</style>
