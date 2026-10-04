<script lang="ts">
  import ThemeToggle from '../../../src/lib/components/ThemeToggle.svelte';
  import type { ZdpThemeMode } from '../../../src/lib/theme';
  let theme = $state<ZdpThemeMode>('light');
  let disabled = $state(false);
  let clicks = $state(0);
  function toggle(): void {
    theme = theme === 'light' ? 'dark' : 'light';
    clicks += 1;
  }
</script>

<section data-testid="theme-toggle-actions">
  <div data-testid="default-theme-toggle"><ThemeToggle {theme} {disabled} onclick={toggle} /></div>
  <div data-testid="custom-theme-toggle"><ThemeToggle {theme} {disabled} onclick={toggle} lightLabel="Use light palette" darkLabel="Use dark palette" /></div>
  <label><input type="checkbox" bind:checked={disabled} />Disable theme actions</label>
  <output data-testid="theme-actions-state">{theme}:{clicks}</output>
</section>
