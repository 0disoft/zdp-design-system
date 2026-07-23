import { mount } from 'svelte';
import '../../../src/styles/index.css';
import PageGutterFixture from './PageGutterFixture.svelte';

mount(PageGutterFixture, {
  target: document.getElementById('app') as HTMLElement
});
