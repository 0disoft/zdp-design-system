import {
  metricDefinitions,
  type BaselineResult,
  type EvaluationStatus,
  type MetricEvaluation,
  type MetricFormat,
  type PackageMeasurement,
  type PackageSizeBudget
} from './model.ts';

const reportMarker = '<!-- zdp-package-size-report -->';

export function evaluateMetrics(
  current: PackageMeasurement,
  baseline: PackageMeasurement | null,
  budget: PackageSizeBudget
): readonly MetricEvaluation[] {
  return metricDefinitions.map(({ key, label, format }) => {
    const currentValue = current.metrics[key];
    const baselineValue = baseline?.metrics[key] ?? null;
    const delta = baselineValue === null ? null : currentValue - baselineValue;
    const deltaPercent = baselineValue === null || baselineValue === 0
      ? null
      : (delta as number) / baselineValue * 100;
    const limit = budget.limits[key];
    const usedPercent = currentValue / limit * 100;
    const status: EvaluationStatus = currentValue > limit
      ? 'fail'
      : usedPercent >= budget.warnAtPercent
        ? 'warn'
        : 'pass';

    return {
      key,
      label,
      format,
      current: currentValue,
      baseline: baselineValue,
      delta,
      deltaPercent,
      limit,
      usedPercent,
      status
    };
  });
}

export function renderMarkdown(
  current: PackageMeasurement,
  baseline: BaselineResult,
  evaluations: readonly MetricEvaluation[],
  passed: boolean
): string {
  const warningCount = evaluations.filter((evaluation) => evaluation.status === 'warn').length;
  const summary = passed
    ? warningCount > 0
      ? `⚠️ Absolute budgets pass; ${warningCount} metric${warningCount === 1 ? '' : 's'} reached the warning zone.`
      : '✅ All absolute package-size budgets pass.'
    : '❌ One or more absolute package-size budgets were exceeded.';
  const baselineLabel = baseline.measurement
    ? `\`${baseline.measurement.packageName}@${baseline.measurement.packageVersion}\` (${escapeMarkdown(baseline.measurement.source)})`
    : 'Unavailable; absolute budgets were still enforced.';
  const rows = evaluations.map((evaluation) => [
    evaluation.label,
    formatMetric(evaluation.current, evaluation.format),
    evaluation.baseline === null ? '—' : formatMetric(evaluation.baseline, evaluation.format),
    formatDelta(evaluation),
    formatMetric(evaluation.limit, evaluation.format),
    `${evaluation.usedPercent.toFixed(1)}%`,
    formatStatus(evaluation.status)
  ]);
  const largestRows = current.largestFiles.map(
    (file) => `| \`${escapeMarkdown(file.path)}\` | ${formatBytes(file.bytes)} |`
  );
  const lines = [
    reportMarker,
    '## 📦 Package size report',
    '',
    summary,
    '',
    `Current: \`${current.packageName}@${current.packageVersion}\` from ${current.source}`,
    '',
    `Baseline: ${baselineLabel}`,
    '',
    '| Metric | Current | Baseline | Delta | Budget | Used | Status |',
    '| --- | ---: | ---: | ---: | ---: | ---: | :---: |',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    '',
    'Relative changes are informational. Only absolute budget overruns fail CI.',
    '',
    '<details>',
    '<summary>Largest package files</summary>',
    '',
    '| Path | Size |',
    '| --- | ---: |',
    ...largestRows,
    '',
    '</details>'
  ];

  if (baseline.note !== null) {
    lines.push('', `<sub>Baseline note: ${escapeMarkdown(baseline.note)}</sub>`);
  }

  return `${lines.join('\n')}\n`;
}

function formatMetric(value: number, format: MetricFormat): string {
  return format === 'bytes' ? formatBytes(value) : value.toLocaleString('en-US');
}

function formatDelta(evaluation: MetricEvaluation): string {
  if (evaluation.delta === null) return '—';
  const sign = evaluation.delta > 0 ? '+' : '';
  const value = evaluation.format === 'bytes'
    ? `${sign}${formatBytes(evaluation.delta)}`
    : `${sign}${evaluation.delta.toLocaleString('en-US')}`;
  const percent = evaluation.deltaPercent === null
    ? ''
    : ` (${evaluation.deltaPercent > 0 ? '+' : ''}${evaluation.deltaPercent.toFixed(1)}%)`;
  return `${value}${percent}`;
}

function formatBytes(value: number): string {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  if (absolute < 1024) return `${sign}${absolute} B`;
  const units = ['KiB', 'MiB', 'GiB'] as const;
  let scaled = absolute;
  let unit: (typeof units)[number] = units[0];

  for (const candidate of units) {
    scaled /= 1024;
    unit = candidate;
    if (scaled < 1024 || candidate === units.at(-1)) break;
  }

  return `${sign}${scaled.toFixed(scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2)} ${unit}`;
}

function formatStatus(status: EvaluationStatus): string {
  if (status === 'fail') return '❌';
  if (status === 'warn') return '⚠️';
  return '✅';
}

function escapeMarkdown(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}
