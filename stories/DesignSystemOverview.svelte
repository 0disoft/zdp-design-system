<script lang="ts">
  import LightOverview from './overview/LightOverview.svelte';
  import DarkOverview from './overview/DarkOverview.svelte';
  import './overview/overview.css';
  import SkipLink from '../src/lib/components/SkipLink.svelte';
  import type { ZdpAccordionItem } from '../src/lib/disclosure.ts';
  import type { ZdpSegmentedControlItem } from '../src/lib/segmented.ts';
  import type { ZdpShareDockItem } from '../src/lib/share.ts';
  import type { ZdpStatusToastItem } from '../src/lib/toast.ts';

  const simpleShipMark = new URL('../src/lib/assets/brand/ship-mark-simple-mono.svg', import.meta.url).href;

  let lightDialogOpen = false;
  let darkDialogOpen = false;
  let lightShareCount = 0;
  let darkShareCount = 0;
  let lightChoiceFrequency: string | null = 'weekly';
  let darkChoiceFrequency: string | null = 'weekly';

  const shareItems: readonly ZdpShareDockItem[] = [
    {
      id: 'copy',
      label: '링크 복사',
      icon: 'copy',
      onclick: () => {
        lightShareCount += 1;
      }
    },
    {
      id: 'device',
      label: '기기 공유',
      icon: 'device',
      onclick: () => {
        lightShareCount += 1;
      }
    },
    { id: 'telegram', label: '텔레그램', icon: 'telegram', href: '#share-telegram' },
    { id: 'line', label: '라인', icon: 'line', href: '#share-line' },
    { id: 'whatsapp', label: '왓츠앱', icon: 'whatsapp', href: '#share-whatsapp' },
    { id: 'x', label: 'X', icon: 'x', href: '#share-x' },
    { id: 'reddit', label: '레딧', icon: 'reddit', href: '#share-reddit' },
    { id: 'facebook', label: '페이스북', icon: 'facebook', href: '#share-facebook' },
    { id: 'threads', label: '스레드', icon: 'threads', href: '#share-threads' },
    { id: 'bluesky', label: '블루스카이', icon: 'bluesky', href: '#share-bluesky' },
    { id: 'linkedin', label: '링크드인', icon: 'linkedin', href: '#share-linkedin' },
    { id: 'weibo', label: '웨이보', icon: 'weibo', href: '#share-weibo' }
  ];

  const darkShareItems: readonly ZdpShareDockItem[] = shareItems.map((item) =>
    item.id === 'copy' || item.id === 'device'
      ? {
          ...item,
          onclick: () => {
            darkShareCount += 1;
          }
        }
      : item
  );

  const lightToastItems: readonly ZdpStatusToastItem[] = [
    {
      id: 'saved',
      tone: 'success',
      title: '저장됐습니다.',
      message: '변경 내역이 목록에 반영됐습니다.',
      actionLabel: '기록 보기',
      href: '#storybook-light-data'
    },
    {
      id: 'warning',
      tone: 'warning',
      title: '확인이 필요합니다.',
      message: '다음 단계 전에 비어 있는 값을 확인하세요.'
    }
  ];

  const darkToastItems: readonly ZdpStatusToastItem[] = [
    {
      id: 'synced',
      tone: 'info',
      title: '동기화가 끝났습니다.',
      message: '열려 있는 화면에서 최신 상태를 볼 수 있습니다.'
    },
    {
      id: 'danger',
      tone: 'danger',
      title: '연결이 끊겼습니다.',
      message: '다시 연결한 뒤 작업을 이어가세요.',
      actionLabel: '다시 연결',
      href: '#storybook-dark-actions'
    }
  ];

  const lightAccordionItems: readonly ZdpAccordionItem[] = [
    {
      id: 'storybook-light-disclosure-scope',
      title: '범위',
      content: '화면 흐름과 데이터 판단은 소비 앱에서 정합니다.',
      open: true
    },
    {
      id: 'storybook-light-disclosure-owner',
      title: '소유자',
      content: '표시할 항목과 권한 판단은 제품 저장소가 연결합니다.'
    }
  ];

  const darkAccordionItems: readonly ZdpAccordionItem[] = [
    {
      id: 'storybook-dark-disclosure-scope',
      title: '검토',
      content: '긴 안내는 같은 자리에서 접고 펼칩니다.',
      open: true
    },
    {
      id: 'storybook-dark-disclosure-owner',
      title: '연결',
      content: '저장, 권한, 데이터 fetch는 소비 화면의 상태와 함께 움직입니다.'
    }
  ];

  const lightSegmentedItems: readonly ZdpSegmentedControlItem[] = [
    { id: 'list', label: '목록' },
    { id: 'cards', label: '카드' },
    { id: 'summary', label: '요약' }
  ];

  const darkSegmentedItems: readonly ZdpSegmentedControlItem[] = [
    { id: 'summary', label: '요약' },
    { id: 'history', label: '기록' },
    { id: 'settings', label: '설정' }
  ];

  const lightCodeExample =
    "const releaseGate = ['owner', 'budget', 'audit-log'];\nconst ready = releaseGate.every((key) => evidence[key] === 'ready');";
  const darkCodeExample =
    "const securityBoundary = {\n  secrets: 'server-only',\n  audit: 'required'\n};";
</script>

<SkipLink href="#foundation-tokens">본문으로 건너뛰기</SkipLink>

<main class="storybook-preview zdp-surface-reset" lang="ko">
  <header class="storybook-preview__header">
    <div>
      <p class="eyebrow">Quiet Ivory</p>
      <div class="storybook-preview__brand">
        <img src={simpleShipMark} alt="" width="48" height="48" />
        <h1 class="zdp-visually-hidden">ZDP Design System</h1>
      </div>
      <p>Ivory surfaces, warm cocoa text, and consistent working controls.</p>
    </div>
    <span>Storybook</span>
  </header>

  <section class="expression-panel" aria-labelledby="storybook-expression-title">
    <div>
      <p class="eyebrow">Type</p>
      <h2 id="storybook-expression-title">표현용 폰트</h2>
      <p>필요한 화면에서만 불러와 쓰는 제목, 캠페인, 짧은 안내용 글꼴 묶음.</p>
    </div>
    <div class="type-specimens" role="group" aria-label="표현용 폰트 샘플">
      <span class="type-specimen type-specimen--script"><small>Script</small><strong>Sunlit routes</strong></span>
      <span class="type-specimen type-specimen--inscription"><small>Inscription</small><strong>Gate Mark</strong></span>
      <span class="type-specimen type-specimen--sketch"><small>Sketch</small><strong>Field Notes</strong></span>
      <span class="type-specimen type-specimen--editorial"><small>Editorial</small><strong>Quiet policy</strong></span>
      <span class="type-specimen type-specimen--sans"><small>Sans</small><strong>Campaign line</strong></span>
      <span class="type-specimen type-specimen--keyboard"><small>Keyboard</small><strong>⌘ K</strong></span>
      <span class="type-specimen type-specimen--brand"><small>Brand wordmark · optional</small><strong class="zdp-brand-wordmark zdp-brand-wordmark--compact">8ailors</strong></span>
    </div>
  </section>

  <div class="storybook-preview__grid">
    <LightOverview bind:lightDialogOpen {lightShareCount} bind:lightChoiceFrequency {shareItems} {lightToastItems} {lightAccordionItems} {lightSegmentedItems} {lightCodeExample} />

    <DarkOverview bind:darkDialogOpen {darkShareCount} bind:darkChoiceFrequency {darkShareItems} {darkToastItems} {darkAccordionItems} {darkSegmentedItems} {darkCodeExample} />
  </div>

  <section class="foundation-strip" id="foundation-tokens" aria-label="Foundation tokens">
    <article>
      <span>Type</span>
      <strong>Body / small / caption / data</strong>
    </article>
    <article>
      <span>Control</span>
      <strong>2.25rem / 2.75rem / --zdp-control-choice-size / --zdp-control-switch-width / --zdp-control-scrollbar-size / --zdp-color-selection-surface / --zdp-color-selection-text</strong>
    </article>
    <article>
      <span>Responsive</span>
      <strong>40 / 64 / 80 / 96rem</strong>
    </article>
    <article>
      <span>i18n</span>
      <strong><span lang="ko">긴문장</span> / <span lang="zh">自由</span> / <span lang="hi">स्वर</span> / <span lang="ja">余白</span> / Safe</strong>
    </article>
  </section>

  <div class="motif-strip" aria-hidden="true">
    <span class="motif-strip__line"></span>
    <span class="motif-strip__mark" aria-hidden="true"></span>
    <span class="motif-strip__line"></span>
  </div>
</main>
