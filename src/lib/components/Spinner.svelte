<script lang="ts">
  import type { ZdpProgressTone, ZdpSpinnerSize } from '../progress.ts';

  export let size: ZdpSpinnerSize = 'md';
  export let tone: ZdpProgressTone = 'primary';
  export let label = '로딩 중';
  export let decorative = false;
  export let semanticRole: 'status' | 'img' | null = 'status';
</script>

<span
  class={`zdp-spinner zdp-spinner--${tone} zdp-spinner--${size}`}
  aria-hidden={decorative ? 'true' : undefined}
  aria-label={decorative ? undefined : label}
  role={decorative ? undefined : semanticRole ?? undefined}
>
  <span class="zdp-spinner__mark" aria-hidden="true"></span>
</span>

<style>
  .zdp-spinner {
    --zdp-spinner-accent: var(--zdp-color-accent-primary);

    align-items: center;
    box-sizing: border-box;
    color: var(--zdp-spinner-accent);
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    line-height: 1;
    -webkit-user-select: none;
    user-select: none;
    vertical-align: middle;
  }

  .zdp-spinner__mark {
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-block-start-color: currentColor;
    border-inline-end-color: currentColor;
    border-radius: 50%;
    box-sizing: border-box;
    display: block;
    -webkit-user-select: none;
    user-select: none;
  }

  .zdp-spinner--sm .zdp-spinner__mark {
    block-size: var(--zdp-control-glyph-sm);
    inline-size: var(--zdp-control-glyph-sm);
  }

  .zdp-spinner--md .zdp-spinner__mark {
    block-size: var(--zdp-control-glyph-md);
    inline-size: var(--zdp-control-glyph-md);
  }

  .zdp-spinner--lg .zdp-spinner__mark {
    block-size: var(--zdp-control-height-sm);
    inline-size: var(--zdp-control-height-sm);
  }

  .zdp-spinner--neutral {
    --zdp-spinner-accent: var(--zdp-color-line-strong);
  }

  .zdp-spinner--primary {
    --zdp-spinner-accent: var(--zdp-color-accent-primary-strong);
  }

  .zdp-spinner--success {
    --zdp-spinner-accent: var(--zdp-color-accent-success);
  }

  .zdp-spinner--warning {
    --zdp-spinner-accent: var(--zdp-color-accent-warning);
  }

  .zdp-spinner--danger {
    --zdp-spinner-accent: var(--zdp-color-accent-danger);
  }

</style>
