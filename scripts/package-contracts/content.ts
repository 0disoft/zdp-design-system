import { readFile } from 'node:fs/promises';
import { readConsumerContract } from '../consumer-document';
import { join, relative } from 'node:path';
import type { PackageCheckContext, PackageJson } from './context';

export function createContentChecks(context: PackageCheckContext) {
const { root, failures } = context;

async function checkShareContract(): Promise<void> {
  const shareTypesPath = 'share.d.ts';
  const shareSourcePath = 'src/lib/share.ts';
  const shareRuntimePath = 'share.js';
  const shareTypes = await readFile(join(root, shareTypesPath), 'utf8');
  const shareSource = await readFile(join(root, shareSourcePath), 'utf8');
  const shareRuntime = await readFile(join(root, shareRuntimePath), 'utf8');
  const targetContract = "readonly target?: '_blank' | '_self' | '_parent' | '_top';";

  if (!shareTypes.includes(targetContract)) {
    failures.push(`${shareTypesPath} must keep ZdpShareDockItem.target aligned with src/lib/share.ts.`);
  }

  if (!shareSource.includes(targetContract)) {
    failures.push(`${shareSourcePath} must keep the constrained share target contract.`);
  }

  if (shareRuntime.includes('src/lib/share') || shareRuntime.includes('from ')) {
    failures.push(`${shareRuntimePath} must stay a self-contained runtime export with no TypeScript source import.`);
  }
}

async function checkButtonContract(): Promise<void> {
  const buttonPath = 'src/lib/components/Button.svelte';
  const componentCssPath = 'src/styles/components.css';
  const button = await readFile(join(root, buttonPath), 'utf8');
  const componentCss = await readFile(join(root, componentCssPath), 'utf8');

  if (!button.includes('font-weight: var(--zdp-font-weight-medium);')) {
    failures.push(`${buttonPath} must use medium label weight.`);
  }

  if (!componentCss.includes('.zdp-button {\n')) {
    failures.push(`${componentCssPath} must keep static .zdp-button styles.`);
  }

  if (!componentCss.includes('font-weight: var(--zdp-font-weight-medium);')) {
    failures.push(`${componentCssPath} must expose medium .zdp-button label weight.`);
  }
}

async function checkCardContract(): Promise<void> {
  const cardPath = 'src/lib/components/Card.svelte';
  const componentCssPath = 'src/styles/components.css';
  const storyPath = 'stories/Layout.svelte';
  const fixturePath = 'fixtures/consumer-svelte-vite/src/App.svelte';
  const consumerContractPath = 'docs/CONSUMER_CONTRACT.md';
  const card = await readFile(join(root, cardPath), 'utf8');
  const componentCss = await readFile(join(root, componentCssPath), 'utf8');
  const story = await readFile(join(root, storyPath), 'utf8');
  const fixture = await readFile(join(root, fixturePath), 'utf8');
  const consumerContract = await readConsumerContract(root);
  const cardCssStart = componentCss.indexOf('.zdp-card {');
  const cardCssEnd = componentCss.indexOf('.zdp-card-header {');
  const cardCss = componentCss.slice(cardCssStart, cardCssEnd);

  for (const requiredText of [
    "as === 'div' && Boolean(ariaLabel?.trim() || ariaLabelledBy?.trim()) ? 'region' : undefined",
    'class={`zdp-card zdp-card--${tone} zdp-card--padding-${padding} ${hover ? \'zdp-card--hover\' : \'\'}`}',
    'border: 1px solid transparent',
    'border-color: var(--zdp-color-line-subtle)',
    '.zdp-card--hover:hover'
  ]) {
    if (!card.includes(requiredText)) {
      failures.push(`${cardPath} is missing non-interactive Card contract text ${requiredText}.`);
    }
  }

  if (cardCssStart === -1 || cardCssEnd === -1 || cardCssEnd <= cardCssStart) {
    failures.push(`${componentCssPath} must keep the static Card style boundary.`);
  }

  for (const requiredText of [
    'border: 1px solid transparent',
    'border-color: var(--zdp-color-line-subtle)'
  ]) {
    if (!cardCss.includes(requiredText)) {
      failures.push(`${componentCssPath} is missing surface-first Card contract text ${requiredText}.`);
    }
  }

  for (const [targetPath, source] of [
    [cardPath, card],
    [componentCssPath, cardCss]
  ] as const) {
    if (!/\.zdp-card--hover:hover\s*\{\s*background:\s*var\(--zdp-color-interaction-hover\);\s*\}/.test(source)) {
      failures.push(`${targetPath} must use the shared interaction-hover token for Card hover feedback.`);
    }
    for (const forbiddenText of ['cursor: pointer', '.zdp-card--hover:focus-visible', 'tabindex=', 'onclick=', 'onkeydown=']) {
      if (source.includes(forbiddenText)) {
        failures.push(`${targetPath} must not make Card itself interactive through ${forbiddenText}.`);
      }
    }
  }

  for (const requiredText of [
    "import Card from '../src/lib/components/Card.svelte';",
    "import CardHeader from '../src/lib/components/CardHeader.svelte';",
    '<Card ',
    '<CardHeader '
  ]) {
    if (!story.includes(requiredText)) {
      failures.push(`${storyPath} is missing Card story evidence ${requiredText}.`);
    }
  }

  for (const requiredText of ['Card,', 'CardHeader,', '<Card ', '<CardHeader ']) {
    if (!fixture.includes(requiredText)) {
      failures.push(`${fixturePath} is missing Card public-package evidence ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'Card와 CardHeader는 비상호작용 콘텐츠 컨테이너다.',
    '전체 카드 이동이나 실행은 내부 Link 또는 Button으로 명시한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`${consumerContractPath} is missing Card consumer contract text ${requiredText}.`);
    }
  }
}

async function checkAdSlotContract(): Promise<void> {
  const relativePath = 'src/lib/components/AdSlot.svelte';
  const source = await readFile(join(root, relativePath), 'utf8');
  const publicEntry = await readFile(join(root, 'src/lib/index.ts'), 'utf8');
  const consumerContract = await readConsumerContract(root);

  for (const requiredText of [
    "import type { ZdpAdSlotPlacement, ZdpAdSlotState }",
    "placement = $bindable('inline')",
    "state = $bindable('pending')",
    "label = $bindable('Advertisement')",
    'fallbackText = $bindable(null)',
    'minHeight = $bindable(null)',
    'reserved = $bindable(true)',
    'data-zdp-ad-slot',
    'data-zdp-ad-placement={placement}',
    'data-zdp-ad-state={state}',
    'data-zdp-ad-reserved={reserved ?',
    'zdp-ad-slot--reserved',
    '.zdp-ad-slot--between-sections',
    '.zdp-ad-slot--rail',
    '.zdp-ad-slot--filled',
    '.zdp-ad-slot__fallback',
    '.zdp-ad-slot--blocked',
    'normalizeIdRefs'
  ]) {
    if (!source.includes(requiredText)) {
      failures.push(`${relativePath} is missing AdSlot contract text ${requiredText}.`);
    }
  }

  for (const forbiddenText of [
    'adsbygoogle',
    'data-ad-client',
    'data-ad-slot',
    'googlesyndication',
    'ads.txt',
    'PUBLIC_AD_CLIENT_ID',
    'PUBLIC_AD_PROVIDER',
    'consent'
  ]) {
    if (source.includes(forbiddenText)) {
      failures.push(`${relativePath} must not own ad provider or consent contract text ${forbiddenText}.`);
    }
  }

  for (const requiredText of [
    'export { default as AdSlot }',
    'export type { ZdpAdSlotPlacement'
  ]) {
    if (!publicEntry.includes(requiredText)) {
      failures.push(`src/lib/index.ts is missing AdSlot public entry ${requiredText}.`);
    }
  }

  for (const requiredText of [
    'AdSlot은 광고나 후원 자리',
    'provider script, consent, slot id, ads.txt, personalized ads 판단은 소비 앱이 계속 소유한다.'
  ]) {
    if (!consumerContract.includes(requiredText)) {
      failures.push(`docs/CONSUMER_CONTRACT.md is missing AdSlot consumer contract text ${requiredText}.`);
    }
  }
}

return { checkShareContract, checkButtonContract, checkCardContract, checkAdSlotContract };
}
