<script lang="ts">
  import Combobox from 'zdp-design-system/components/Combobox';
  let query = $state('');
  const candidates = Array.from({ length: 40 }, (_, index) => ({
    id: `team-${index}`, value: `team-${index}`, label: `Team ${index + 1}`
  }));
  const options = $derived(candidates.filter(option => option.label.includes(query)));
</script>
<form><Combobox bind:query {options} name="team" label="Astro team" /></form>
