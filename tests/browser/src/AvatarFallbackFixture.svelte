<script lang="ts">
  import Avatar from '../../../src/lib/components/Avatar.svelte';
  import IdentityChip from '../../../src/lib/components/IdentityChip.svelte';
  let imageSrc: string | null = '/missing-avatar-image.png';
  const validImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16"%3E%3Crect width="16" height="16" fill="red"/%3E%3C/svg%3E';
</script>

<section data-testid="avatar-fallback-fixture" aria-label="Avatar image recovery">
  <div data-testid="avatar-standalone"><Avatar {imageSrc} initials="ZD" label="Zerodi" /></div>
  <div data-testid="avatar-chip"><IdentityChip imageSrc="/missing-avatar-chip.png" initials="AB" label="Another member" /></div>
  <div data-testid="avatar-empty"><Avatar imageSrc="/missing-avatar-empty.png" label="Member without initials" /></div>
  <button type="button" onclick={() => imageSrc = validImage}>Load valid avatar</button>
  <button type="button" onclick={() => imageSrc = null}>Clear avatar image</button>
  <button type="button" onclick={() => imageSrc = '/missing-avatar-image.png'}>Retry broken avatar</button>
</section>
