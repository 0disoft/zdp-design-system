<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../src/lib/components/Button.svelte';
  import Card from '../src/lib/components/Card.svelte';
  import CardHeader from '../src/lib/components/CardHeader.svelte';
  import Container from '../src/lib/components/Container.svelte';
  import Grid from '../src/lib/components/Grid.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Page from '../src/lib/components/Page.svelte';
  import PageHeader from '../src/lib/components/PageHeader.svelte';
  import ResizableSplitPane from '../src/lib/components/ResizableSplitPane.svelte';
  import Section from '../src/lib/components/Section.svelte';
  import Sheet from '../src/lib/components/Sheet.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Toolbar from '../src/lib/components/Toolbar.svelte';
  import { clampZdpSplitPaneSize, createZdpSplitPaneSizePersistence } from '../src/lib/split-pane';

  const splitPanePersistence = createZdpSplitPaneSizePersistence({
    key: 'storybook-layout-contents',
    defaultSize: 280,
    minSize: 220,
    maxSize: 480
  });
  let splitPaneSize = 280;
  let compactContentsOpen = false;

  onMount(() => {
    splitPaneSize = splitPanePersistence.load();
  });

  function setSplitPaneSize(size: number): void {
    splitPaneSize = clampZdpSplitPaneSize(size);
    splitPanePersistence.save(splitPaneSize);
  }
</script>

<main class="layout-story zdp-surface-reset" lang="ko">
  <Page as="div" tone="canvas" labelledBy="layout-story-title">
    <Section spacing="xl">
      <Container size="lg" gutter="page">
        <PageHeader labelledBy="layout-story-title" align="center">
          <span slot="eyebrow" class="layout-story__eyebrow">Layout</span>
          <h1 id="layout-story-title">화면의 첫 장면</h1>
          <p slot="summary">페이지 폭과 섹션 리듬은 조용하게 맞추고, 제품의 결정은 각 저장소에 남긴다.</p>
          <svelte:fragment slot="actions">
            <Button variant="primary">시작</Button>
            <Button variant="secondary">기록</Button>
          </svelte:fragment>
        </PageHeader>
      </Container>
    </Section>

    <Section tone="panel" spacing="lg" labelledBy="layout-panel-title">
      <Container size="lg" gutter="page">
        <Stack gap="lg">
          <PageHeader as="div" labelledBy="layout-panel-title">
            <span slot="eyebrow" class="layout-story__eyebrow">Section</span>
            <h2 id="layout-panel-title">작업을 모으는 폭</h2>
            <p slot="summary">넓은 화면에서는 줄 길이를 붙잡고, 작은 화면에서는 액션이 자연스럽게 아래로 내려온다.</p>
          </PageHeader>
          <Grid columns="two" gap="md" labelledBy="layout-panel-title">
            <Card as="section" ariaLabelledBy="layout-public-card-title" hover>
              <svelte:fragment slot="header">
                <CardHeader id="layout-public-card-title">공개 표면</CardHeader>
              </svelte:fragment>
              <p>브랜드, 문서, 로드맵처럼 반복해서 확인하는 화면을 차분하게 묶는다.</p>
            </Card>
            <Card as="section" ariaLabelledBy="layout-work-card-title" tone="raised">
              <svelte:fragment slot="header">
                <CardHeader id="layout-work-card-title">작업 표면</CardHeader>
              </svelte:fragment>
              <p>설정, 입력, 검토 흐름은 같은 여백과 같은 focus 규칙 위에 놓인다.</p>
            </Card>
          </Grid>
        </Stack>
      </Container>
    </Section>

    <Section spacing="lg">
      <Container size="md" gutter="page">
        <Stack gap="md" align="start">
          <span class="layout-story__eyebrow">Container</span>
          <h2>읽기 좋은 본문 폭</h2>
          <p class="layout-story__copy">본문 중심 화면은 더 좁은 폭을 선택해 줄 길이와 시선 이동을 안정적으로 유지한다.</p>
          <Inline gap="sm">
            <Button variant="secondary">자세히 보기</Button>
            <Button variant="danger">삭제</Button>
          </Inline>
        </Stack>
      </Container>
    </Section>

    <Section tone="raised" spacing="lg" labelledBy="layout-toolbar-title">
      <Container size="lg" gutter="page">
        <Toolbar labelledBy="layout-toolbar-title">
          <Stack gap="xs">
            <span class="layout-story__eyebrow">Toolbar</span>
            <h2 id="layout-toolbar-title">검토 흐름 정리</h2>
          </Stack>
          <svelte:fragment slot="actions">
            <Button variant="secondary">초안</Button>
            <Button variant="primary">검토 요청</Button>
          </svelte:fragment>
        </Toolbar>
      </Container>
    </Section>

    <Section spacing="lg" labelledBy="layout-split-pane-title">
      <Container size="lg" gutter="page">
        <Stack gap="md">
          <PageHeader as="div" labelledBy="layout-split-pane-title">
            <span slot="eyebrow" class="layout-story__eyebrow">Workspace</span>
            <h2 id="layout-split-pane-title">읽을 곳을 내 손에 맞추기</h2>
            <p slot="summary">목차 폭은 그대로 기억하고, 작은 화면에서는 본문을 먼저 보여준다.</p>
          </PageHeader>

          <div class="layout-story__split-desktop">
            <ResizableSplitPane
              bind:size={splitPaneSize}
              minSize={220}
              maxSize={480}
              secondaryMinSize={320}
              ariaLabel="목차 너비 조절"
              getValueText={(size) => `${size}픽셀`}
              onResizeCommit={(size) => splitPanePersistence.save(size)}
            >
              {#snippet primary()}
                <nav class="layout-story__contents" aria-label="문서 목차">
                  <strong>목차</strong>
                  <a href="#layout-story-overview">한눈에 보기</a>
                  <a href="#layout-story-guidelines">길어도 잘리는 항목 이름을 확인하는 안내</a>
                  <a href="#layout-story-notes">변경 기록</a>
                </nav>
              {/snippet}

              <article class="layout-story__document" aria-labelledby="layout-story-overview">
                <h3 id="layout-story-overview">한눈에 보기</h3>
                <p>본문과 목차의 비율은 글자 크기를 바꿔도 그대로 남는다. 필요한 폭만 경계선을 움직여 맞춘다.</p>
                <h3 id="layout-story-guidelines">읽기 흐름</h3>
                <p>긴 제목은 목차 안에서 한 줄로 정리되고, 본문은 남은 공간에서 자연스럽게 줄을 바꾼다.</p>
                <h3 id="layout-story-notes">변경 기록</h3>
                <p>마지막으로 선택한 목차 폭은 다음 방문에도 이어진다.</p>
              </article>
            </ResizableSplitPane>

            <Inline gap="sm">
              <Button variant="secondary" onclick={() => setSplitPaneSize(splitPaneSize - 32)}>좁게</Button>
              <Button variant="secondary" onclick={() => setSplitPaneSize(splitPaneSize + 32)}>넓게</Button>
              <Button variant="secondary" onclick={() => setSplitPaneSize(280)}>기본 폭</Button>
            </Inline>
          </div>

          <div class="layout-story__split-compact">
            <Button
              variant="secondary"
              ariaControls="layout-compact-contents"
              ariaExpanded={compactContentsOpen}
              onclick={() => (compactContentsOpen = true)}
            >
              목차 열기
            </Button>
            <article class="layout-story__document" aria-labelledby="layout-compact-document-title">
              <h3 id="layout-compact-document-title">한눈에 보기</h3>
              <p>작은 화면에서는 본문을 먼저 읽고, 목차는 필요할 때 화면 가장자리에서 연다.</p>
            </article>
            <Sheet
              open={compactContentsOpen}
              id="layout-compact-contents"
              labelledBy="layout-compact-contents-title"
              placement="left"
              onClose={() => (compactContentsOpen = false)}
            >
              <h2 slot="title" id="layout-compact-contents-title">목차</h2>
              <nav class="layout-story__contents" aria-label="작은 화면 문서 목차">
                <a href="#layout-compact-document-title" onclick={() => (compactContentsOpen = false)}>한눈에 보기</a>
                <a href="#layout-compact-document-title" onclick={() => (compactContentsOpen = false)}>읽기 흐름</a>
                <a href="#layout-compact-document-title" onclick={() => (compactContentsOpen = false)}>변경 기록</a>
              </nav>
            </Sheet>
          </div>
        </Stack>
      </Container>
    </Section>
  </Page>
</main>

<style>
  .layout-story {
    min-height: var(--zdp-viewport-block);
  }

  .layout-story__eyebrow {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
    text-transform: uppercase;
  }

  .layout-story h1,
  .layout-story h2 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
  }

  .layout-story h1 {
    font-size: var(--zdp-type-page-title-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-page-title-line-height);
  }

  .layout-story h2 {
    font-size: var(--zdp-type-title-size);
  }

  .layout-story__copy {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
    margin: var(--zdp-space-2) 0 0;
  }

  .layout-story__split-desktop {
    display: grid;
    gap: var(--zdp-space-3);
  }

  .layout-story__split-desktop > :global(.zdp-resizable-split-pane) {
    background: var(--zdp-color-surface-panel);
    block-size: 32rem;
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
  }

  .layout-story__contents,
  .layout-story__document {
    box-sizing: border-box;
    padding: var(--zdp-space-5);
  }

  .layout-story__contents {
    display: grid;
    gap: var(--zdp-space-3);
  }

  .layout-story__contents a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .layout-story__document {
    overflow-wrap: anywhere;
  }

  .layout-story__document h3 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
    margin: 0 0 var(--zdp-space-3);
  }

  .layout-story__document p {
    color: var(--zdp-color-ink-muted);
    line-height: var(--zdp-type-body-line-height);
    margin: 0 0 var(--zdp-space-5);
  }

  .layout-story__split-compact {
    display: none;
  }

  @media (max-width: 48rem) {
    .layout-story h1 {
      font-size: var(--zdp-type-page-title-compact-size);
    }

    .layout-story__split-desktop {
      display: none;
    }

    .layout-story__split-compact {
      display: grid;
      gap: var(--zdp-space-4);
    }
  }
</style>
