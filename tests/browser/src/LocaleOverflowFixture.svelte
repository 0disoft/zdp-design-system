<script lang="ts">
  import LocaleSwitcher from '../../../src/lib/components/LocaleSwitcher.svelte';
  const options = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'ru'].map((value) => ({ value, label: value.toUpperCase() }));
</script>

<section data-testid="locale-overflow" style="width: min(100%, 280px)">
  <LocaleSwitcher {options} ariaLabel="Scrollable languages" />
  <div class="zdp-locale-switcher" role="radiogroup" aria-label="CSS scrollable languages">
    {#each options as option}
      <button class="zdp-locale-switcher__item" type="button" role="radio" aria-checked={option.value === 'en'}>
        <span class="zdp-locale-switcher__label">{option.label}</span>
      </button>
    {/each}
  </div>
</section>
