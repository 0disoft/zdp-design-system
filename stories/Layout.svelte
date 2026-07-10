<script lang="ts">
  import Button from '../src/lib/components/Button.svelte';
  import Card from '../src/lib/components/Card.svelte';
  import CardHeader from '../src/lib/components/CardHeader.svelte';
  import Container from '../src/lib/components/Container.svelte';
  import Grid from '../src/lib/components/Grid.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import Page from '../src/lib/components/Page.svelte';
  import PageHeader from '../src/lib/components/PageHeader.svelte';
  import Section from '../src/lib/components/Section.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Toolbar from '../src/lib/components/Toolbar.svelte';
</script>

<main class="layout-story zdp-surface-reset" lang="ko">
  <Page as="div" tone="canvas" labelledBy="layout-story-title">
    <Section spacing="xl">
      <Container size="lg" padding="lg">
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
      <Container size="lg" padding="lg">
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
      <Container size="md" padding="lg">
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
      <Container size="lg" padding="lg">
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

  @media (max-width: 48rem) {
    .layout-story h1 {
      font-size: var(--zdp-type-page-title-compact-size);
    }

  }
</style>
