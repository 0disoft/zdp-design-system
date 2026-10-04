<script lang="ts">
  import Input from '../../../src/lib/components/Input.svelte';
  import Textarea from '../../../src/lib/components/Textarea.svelte';

  let text = '';
  let notes = '';
  let events: string[] = [];
  function record(event: Event): void {
    events = [...events, event.type];
  }
</script>

<section aria-label="Native input contracts">
  <form id="native-input-form"></form>
  <Input ariaLabel="Native quantity" form="native-input-form" name="quantity" type="number" min={2} max={10} step={2} />
  <Input
    ariaLabel="Native code" form="native-input-form" name="code"
    minlength={2} maxlength={4} pattern="[A-Z]{2,4}" inputmode="text" enterkeyhint="next"
    bind:value={text} oninput={record} onchange={record} onfocus={record} onblur={record} onkeydown={record}
  />
  <Textarea
    ariaLabel="Native notes" form="native-input-form" name="notes"
    minlength={2} maxlength={6} autocomplete="off" inputmode="text" enterkeyhint="done"
    bind:value={notes} oninput={record} onchange={record} onfocus={record} onblur={record} onkeydown={record}
  />
  <output data-testid="native-code-value">{text}</output>
  <output data-testid="native-notes-value">{notes}</output>
  <output data-testid="native-input-events">{events.join(',')}</output>
</section>
