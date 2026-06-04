<script lang="ts">
  import Badge from '../src/lib/components/Badge.svelte';
  import Button from '../src/lib/components/Button.svelte';
  import EmptyState from '../src/lib/components/EmptyState.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import KeyValue from '../src/lib/components/KeyValue.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Table from '../src/lib/components/Table.svelte';
</script>

<main class="component-story zdp-surface-reset" lang="ko">
  <header class="component-story__header">
    <p>Data Display</p>
    <h1>Operational information</h1>
  </header>

  <div class="component-story__grid">
    <section class="component-story__panel" data-zdp-theme="light" aria-labelledby="data-light-title">
      <h2 id="data-light-title">Light</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <div class="story-section-heading">
              <h3 id="data-light-table-title">보안 점검</h3>
              <Badge tone="success">정상</Badge>
            </div>
            <Table caption="보안 점검 목록" labelledBy="data-light-table-title" density="compact">
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col">상태</th>
                  <th scope="col">다음 확인</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">권한 분리</th>
                  <td>통과</td>
                  <td>분기 리뷰</td>
                </tr>
                <tr>
                  <th scope="row">감사 로그</th>
                  <td>통과</td>
                  <td>릴리스 전</td>
                </tr>
                <tr>
                  <th scope="row">비밀값 보관</th>
                  <td>대기</td>
                  <td>운영 전</td>
                </tr>
              </tbody>
            </Table>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3 id="data-light-key-value-title">원장 경계</h3>
            <KeyValue columns="two" labelledBy="data-light-key-value-title">
              <dt>소유 저장소</dt>
              <dd>zdp-money-platform</dd>
              <dt>실험 저장소</dt>
              <dd>zdp-products-lab</dd>
              <dt>승격 조건</dt>
              <dd>예산, 소유자, 운영 증거가 모두 확인된 뒤 이동</dd>
            </KeyValue>
          </Stack>
        </Surface>

        <EmptyState labelledBy="data-light-empty-title">
          <h3 id="data-light-empty-title">아직 공개할 변경이 없습니다.</h3>
          <p>검토가 끝난 항목만 공개 로드맵에 올라갑니다.</p>
          <svelte:fragment slot="actions">
            <Button variant="secondary">초안 보기</Button>
          </svelte:fragment>
        </EmptyState>
      </Stack>
    </section>

    <section class="component-story__panel" data-zdp-theme="dark" aria-labelledby="data-dark-title">
      <h2 id="data-dark-title">Dark</h2>
      <Stack gap="lg">
        <Surface padding="lg">
          <Stack gap="md">
            <div class="story-section-heading">
              <h3 id="data-dark-table-title">보안 점검</h3>
              <Badge tone="warning">대기</Badge>
            </div>
            <Table caption="보안 점검 목록" labelledBy="data-dark-table-title" density="compact">
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col">상태</th>
                  <th scope="col">다음 확인</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">권한 분리</th>
                  <td>통과</td>
                  <td>분기 리뷰</td>
                </tr>
                <tr>
                  <th scope="row">감사 로그</th>
                  <td>통과</td>
                  <td>릴리스 전</td>
                </tr>
                <tr>
                  <th scope="row">비밀값 보관</th>
                  <td>대기</td>
                  <td>운영 전</td>
                </tr>
              </tbody>
            </Table>
          </Stack>
        </Surface>

        <Surface padding="lg">
          <Stack gap="md">
            <h3 id="data-dark-key-value-title">원장 경계</h3>
            <KeyValue columns="two" labelledBy="data-dark-key-value-title">
              <dt>소유 저장소</dt>
              <dd>zdp-money-platform</dd>
              <dt>실험 저장소</dt>
              <dd>zdp-products-lab</dd>
              <dt>승격 조건</dt>
              <dd>예산, 소유자, 운영 증거가 모두 확인된 뒤 이동</dd>
            </KeyValue>
          </Stack>
        </Surface>

        <EmptyState tone="raised" align="center" labelledBy="data-dark-empty-title">
          <h3 id="data-dark-empty-title">대기 중인 알림이 없습니다.</h3>
          <p>위험 신호가 생기면 이 자리에 바로 표시됩니다.</p>
          <svelte:fragment slot="actions">
            <Inline gap="sm" justify="center">
              <Button variant="secondary">기록 보기</Button>
              <Button>새로 고침</Button>
            </Inline>
          </svelte:fragment>
        </EmptyState>
      </Stack>
    </section>
  </div>
</main>

<style>
  .component-story {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-8);
    min-height: 100vh;
    padding: var(--zdp-space-8);
  }

  .component-story__header {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .component-story__header p {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-label-line-height);
    margin: 0;
    text-transform: uppercase;
  }

  .component-story__header h1 {
    color: var(--zdp-color-ink-strong);
    font-family: var(--zdp-font-family-display);
    font-size: var(--zdp-type-page-title-size);
    font-weight: var(--zdp-font-weight-medium);
    line-height: var(--zdp-type-page-title-line-height);
    margin: 0;
  }

  .component-story__grid {
    display: grid;
    gap: var(--zdp-space-6);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .component-story__panel {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-5);
    min-width: 0;
    padding: var(--zdp-space-6);
  }

  .component-story__panel h2,
  .component-story__panel h3 {
    color: var(--zdp-color-ink-strong);
    margin: 0;
  }

  .component-story__panel h2 {
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
  }

  .component-story__panel h3 {
    font-size: var(--zdp-type-body-size);
    line-height: var(--zdp-type-body-line-height);
  }

  .story-section-heading {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-2);
    justify-content: space-between;
    min-width: 0;
  }

  @media (max-width: 860px) {
    .component-story {
      padding: var(--zdp-space-4);
    }

    .component-story__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
