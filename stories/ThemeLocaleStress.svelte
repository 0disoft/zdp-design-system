<script lang="ts">
  import Badge from '../src/lib/components/Badge.svelte';
  import Button from '../src/lib/components/Button.svelte';
  import Callout from '../src/lib/components/Callout.svelte';
  import CodeBlock from '../src/lib/components/CodeBlock.svelte';
  import CommandField from '../src/lib/components/CommandField.svelte';
  import Inline from '../src/lib/components/Inline.svelte';
  import InlineCode from '../src/lib/components/InlineCode.svelte';
  import Pagination from '../src/lib/components/Pagination.svelte';
  import Progress from '../src/lib/components/Progress.svelte';
  import Skeleton from '../src/lib/components/Skeleton.svelte';
  import SortHeader from '../src/lib/components/SortHeader.svelte';
  import Spinner from '../src/lib/components/Spinner.svelte';
  import Stack from '../src/lib/components/Stack.svelte';
  import Surface from '../src/lib/components/Surface.svelte';
  import Table from '../src/lib/components/Table.svelte';
  import TableToolbar from '../src/lib/components/TableToolbar.svelte';
  import Toast from '../src/lib/components/Toast.svelte';
  import Tooltip from '../src/lib/components/Tooltip.svelte';

  type StressTheme = {
    readonly id: 'light' | 'dark';
    readonly title: string;
    readonly badge: string;
    readonly commandValue: string;
    readonly progress: number | null;
    readonly tone: 'info' | 'success' | 'warning';
  };

  type LocaleSample = {
    readonly lang: 'ko' | 'en' | 'zh' | 'hi' | 'vi' | 'ru' | 'ms' | 'th';
    readonly label: string;
    readonly text: string;
  };

  const themes: readonly StressTheme[] = [
    {
      id: 'light',
      title: 'Light',
      badge: 'Mobile 390',
      commandValue: '긴 문장, 초점, 모바일 폭',
      progress: 72,
      tone: 'info'
    },
    {
      id: 'dark',
      title: 'Dark',
      badge: 'Mobile 390',
      commandValue: '中文超长文本, Focus, Hindi',
      progress: null,
      tone: 'warning'
    }
  ];

  const localeSamples: readonly LocaleSample[] = [
    {
      lang: 'ko',
      label: '한국어',
      text:
        '승인대기중인긴프로젝트이름과띄어쓰기가거의없는상태메시지가좁은화면에서도버튼과표를밀어내지않는지 확인합니다.'
    },
    {
      lang: 'en',
      label: 'English',
      text:
        'Super-long audit trail names and unusually persistent operational notes should wrap without hiding actions or clipping focus rings.'
    },
    {
      lang: 'zh',
      label: '中文',
      text:
        '这是一个非常长的状态说明用于检查中文文本在窄屏幕里是否保持清晰不会挤压按钮表格和提示。'
    },
    {
      lang: 'hi',
      label: 'हिन्दी',
      text:
        'लंबे समीक्षा संदेश और लगातार बदलती स्थिति संकरी स्क्रीन पर भी साफ दिखनी चाहिए और फोकस रिंग छिपनी नहीं चाहिए।'
    },
    {
      lang: 'vi',
      label: 'Tiếng Việt',
      text:
        'Chuỗi trạng thái rất dài với nhiều dấu tiếng Việt phải xuống dòng tự nhiên mà không che nút hoặc vòng focus.'
    },
    {
      lang: 'ru',
      label: 'Русский',
      text:
        'Очень длинное сообщение о проверке доступа должно переноситься без обрезки действий и видимого фокуса.'
    },
    {
      lang: 'ms',
      label: 'Bahasa Melayu',
      text:
        'Nama tugasan yang panjang dan status semakan perlu kekal jelas pada lebar mudah alih tanpa menolak tindakan.'
    },
    {
      lang: 'th',
      label: 'ไทย',
      text:
        'ข้อความสถานะภาษาไทยที่ยาวมากต้องอ่านได้ในหน้าจอแคบและไม่บังปุ่มหรือเส้นโฟกัส'
    }
  ];

  const tableRows = [
    {
      item: '긴한국어항목명-권한검토-모바일폭-줄바꿈확인',
      status: '검토 중',
      owner: '플랫폼 운영'
    },
    {
      item: '非常长的中文项目名称用于检查表格横向滚动',
      status: '대기',
      owner: 'Asia Review'
    },
    {
      item: 'Hindi review note with देवनागरी text and long owner names',
      status: '준비',
      owner: 'Locale Quality'
    },
    {
      item: 'Thai status note สำหรับตรวจสอบความกว้างบนมือถือ',
      status: '대기',
      owner: 'Locale QA'
    }
  ] as const;

  const codeExample =
    "const labels = ['ko', 'en', 'zh', 'hi', 'vi', 'ru', 'ms', 'th'];\nconst focusVisible = labels.every((locale) => viewport.width <= 390 || locale.length > 0);\nconst horizontalOverflowProbe = 'ko-승인대기-zh-非常长的中文项目名称-hi-देवनागरी-th-ข้อความยาวมาก-long-owner-name-without-manual-line-breaks';";
</script>

<main class="stress-story zdp-surface-reset" lang="ko">
  <header class="stress-story__header">
    <p>Theme / Locale Stress</p>
    <h1>긴 문장과 초점 확인</h1>
  </header>

  <div class="stress-story__grid">
    {#each themes as theme}
      <section class="stress-panel" data-zdp-theme={theme.id} aria-labelledby={`stress-${theme.id}-title`}>
        <div class="stress-panel__heading">
          <div>
            <p>Theme</p>
            <h2 id={`stress-${theme.id}-title`}>{theme.title}</h2>
          </div>
          <Badge tone={theme.id === 'light' ? 'success' : 'warning'}>{theme.badge}</Badge>
        </div>

        <div class="stress-device">
          <Stack gap="lg">
            <Surface padding="lg">
              <Stack gap="md">
                <div class="stress-section-heading">
                  <h3 id={`stress-${theme.id}-device-title`}>좁은 화면</h3>
                  <InlineCode text="24.375rem" />
                </div>

                <div class="stress-locale-list">
                  {#each localeSamples as sample}
                    <article class="stress-locale-card" lang={sample.lang}>
                      <strong>{sample.label}</strong>
                      <p>{sample.text}</p>
                    </article>
                  {/each}
                </div>
              </Stack>
            </Surface>

            <Surface padding="lg">
              <Stack gap="md">
                <h3 id={`stress-${theme.id}-focus-title`}>초점</h3>
                <div
                  class="stress-focus-grid"
                  role="group"
                  aria-labelledby={`stress-${theme.id}-focus-title`}
                >
                  <div class="stress-force-focus">
                    <Button variant="primary">검토 저장</Button>
                  </div>
                  <div class="stress-force-focus">
                    <Tooltip
                      id={`stress-${theme.id}-tooltip`}
                      text="짧은 도움말"
                      placement={theme.id === 'light' ? 'top' : 'bottom'}
                      let:describedBy
                    >
                      <Button variant="secondary" ariaDescribedBy={describedBy}>
                        도움말
                      </Button>
                    </Tooltip>
                  </div>
                  <div class="stress-force-focus">
                    <CommandField
                      id={`stress-${theme.id}-command`}
                      name={`stress-${theme.id}-command`}
                      label="빠른 찾기"
                      labelVisible
                      value={theme.commandValue}
                      placeholder="문서, 상태, 담당자 검색"
                      describedBy={`stress-${theme.id}-command-help`}
                    />
                  </div>
                </div>
                <p class="stress-status" id={`stress-${theme.id}-command-help`}>
                  Tab으로 이동했을 때 테두리와 outline이 잘리지 않아야 합니다.
                </p>
              </Stack>
            </Surface>

            <Surface padding="lg">
              <Stack gap="md">
                <Callout
                  tone={theme.id === 'light' ? 'info' : 'warning'}
                >
                  <strong id={`stress-${theme.id}-callout-title`}>문장이 길어져도 흐름은 그대로입니다.</strong>
                  <p lang={theme.id === 'light' ? 'ko' : 'hi'}>
                    {theme.id === 'light'
                      ? '사용자가 읽는 문장은 자연스럽게 줄바꿈되고, 상태 배지는 근처 맥락을 잃지 않습니다.'
                      : 'लंबा संदेश आने पर भी सतह, बॉर्डर और फोकस संकेत अपनी जगह बनाए रखते हैं।'}
                  </p>
                </Callout>

                <Toast
                  tone={theme.tone}
                  labelledBy={`stress-${theme.id}-toast-title`}
                  describedBy={`stress-${theme.id}-toast-message`}
                  live="off"
                >
                  <strong id={`stress-${theme.id}-toast-title`}>알림이 준비됐습니다.</strong>
                  <p id={`stress-${theme.id}-toast-message`} lang={theme.id === 'light' ? 'zh' : 'en'}>
                    {theme.id === 'light'
                      ? '长消息也应该在小屏幕里保持可读并且不遮住关闭按钮。'
                      : 'A long status toast should stay readable without pretending to own queue timing.'}
                  </p>
                </Toast>
              </Stack>
            </Surface>

            <Surface padding="lg">
              <Stack gap="md">
                <h3 id={`stress-${theme.id}-table-title`}>표와 페이지</h3>
                <TableToolbar
                  title="다국어 점검 목록"
                  summary="긴 이름과 선택 액션을 같은 폭에서 봅니다."
                  selectedCount={theme.id === 'light' ? 2 : 1}
                  density="compact"
                  densityLabel="밀도"
                  labelledBy={`stress-${theme.id}-table-title`}
                >
                  <svelte:fragment slot="selection-actions">
                    <Button variant="secondary">선택 해제</Button>
                  </svelte:fragment>
                  <svelte:fragment slot="actions">
                    <Button>새로 고침</Button>
                  </svelte:fragment>
                </TableToolbar>
                <Table caption="다국어 점검 목록" labelledBy={`stress-${theme.id}-table-title`} density="compact">
                  <thead>
                    <tr>
                      <th scope="col" aria-sort={theme.id === 'light' ? 'ascending' : undefined}>
                        <SortHeader
                          label="항목"
                          direction={theme.id === 'light' ? 'ascending' : 'none'}
                        />
                      </th>
                      <th scope="col" aria-sort={theme.id === 'dark' ? 'descending' : undefined}>
                        <SortHeader
                          label="상태"
                          direction={theme.id === 'dark' ? 'descending' : 'none'}
                        />
                      </th>
                      <th scope="col">담당</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableRows as row}
                      <tr>
                        <th scope="row">{row.item}</th>
                        <td>{row.status}</td>
                        <td>{row.owner}</td>
                      </tr>
                    {/each}
                  </tbody>
                </Table>
                <div class="stress-force-focus">
                  <Pagination
                    currentPage={theme.id === 'light' ? 3 : 7}
                    totalPages={12}
                    siblingCount={1}
                    ariaLabel={`${theme.title} stress pages`}
                  />
                </div>
              </Stack>
            </Surface>

            <Surface padding="lg">
              <Stack gap="md">
                <h3 id={`stress-${theme.id}-loading-title`}>진행과 자리</h3>
                <Progress
                  value={theme.progress}
                  tone={theme.id === 'light' ? 'success' : 'warning'}
                  labelledBy={`stress-${theme.id}-loading-title`}
                  valueText={theme.progress ? `${theme.progress}% 완료` : '응답 대기 중'}
                />
                <Inline gap="sm" align="center">
                  <Spinner
                    size="sm"
                    tone={theme.id === 'light' ? 'success' : 'warning'}
                    label={`${theme.title} 응답 확인 중`}
                  />
                  <span class="stress-status">응답 확인 중</span>
                </Inline>
                <Skeleton variant="text" lines={3} />
                <CodeBlock
                  label={`${theme.title} locale check`}
                  language="ts"
                  code={codeExample}
                  labelledBy={`stress-${theme.id}-loading-title`}
                />
              </Stack>
            </Surface>
          </Stack>
        </div>
      </section>
    {/each}
  </div>
</main>

<style>
  .stress-story {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-8);
    min-height: var(--zdp-viewport-block);
    padding: var(--zdp-space-8);
  }

  .stress-story__header {
    display: grid;
    gap: var(--zdp-space-2);
  }

  .stress-story__header p,
  .stress-panel__heading p {
    color: var(--zdp-color-accent-danger);
    font-size: var(--zdp-type-label-size);
    font-weight: var(--zdp-font-weight-medium);
    letter-spacing: 0;
    line-height: var(--zdp-type-label-line-height);
    margin: 0;
    text-transform: uppercase;
  }

  .stress-story__header h1 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-page-title-compact-size);
    line-height: var(--zdp-type-page-title-line-height);
    margin: 0;
  }

  .stress-story__grid {
    align-items: start;
    display: grid;
    gap: var(--zdp-space-6);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 32rem), 1fr));
  }

  .stress-panel {
    background: var(--zdp-color-surface-canvas);
    color: var(--zdp-color-ink-normal);
    display: grid;
    gap: var(--zdp-space-4);
    min-width: 0;
  }

  .stress-panel__heading,
  .stress-section-heading {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--zdp-space-3);
    justify-content: space-between;
    min-width: 0;
  }

  .stress-panel__heading h2,
  .stress-section-heading h3,
  .stress-panel h3 {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-title-size);
    line-height: var(--zdp-type-title-line-height);
    margin: 0;
  }

  .stress-device {
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-strong);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    inline-size: min(100%, 24.375rem);
    margin-inline: auto;
    min-width: 0;
    padding: var(--zdp-space-3);
  }

  .stress-locale-list,
  .stress-focus-grid {
    display: grid;
    gap: var(--zdp-space-3);
    min-width: 0;
  }

  .stress-locale-card {
    background: var(--zdp-color-surface-panel);
    border: var(--zdp-control-border-width) solid var(--zdp-color-line-subtle);
    border-radius: var(--zdp-control-radius);
    box-sizing: border-box;
    display: grid;
    gap: var(--zdp-space-2);
    min-width: 0;
    padding: var(--zdp-space-3);
  }

  .stress-locale-card strong {
    color: var(--zdp-color-ink-strong);
    font-size: var(--zdp-type-label-size);
    line-height: var(--zdp-type-label-line-height);
  }

  .stress-locale-card p,
  .stress-status {
    color: var(--zdp-color-ink-muted);
    font-size: var(--zdp-type-body-small-size);
    line-height: var(--zdp-type-body-small-line-height);
    margin: 0;
    overflow-wrap: var(--zdp-i18n-overflow-wrap);
  }

  .stress-force-focus {
    display: grid;
    min-width: 0;
  }

  .stress-force-focus :global(.zdp-button),
  .stress-force-focus :global(.zdp-command-field),
  .stress-force-focus :global(.zdp-pagination__link:not(:disabled)) {
    border-color: var(--zdp-color-focus-line);
    outline: var(--zdp-control-focus-outline-width) solid var(--zdp-color-focus-surface);
    outline-offset: var(--zdp-control-focus-outline-offset);
  }

  @media (max-width: 48rem) {
    .stress-story {
      padding: var(--zdp-space-4);
    }
  }
</style>
