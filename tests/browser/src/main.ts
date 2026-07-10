import { mount } from 'svelte';
import '../../../src/styles/index.css';
import CardBrowserFixture from './CardBrowserFixture.svelte';

mount(CardBrowserFixture, {
  target: document.getElementById('app') as HTMLElement
});
