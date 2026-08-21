export const metricDefinitions = [
  { key: 'tarballBytes', label: 'npm tarball', format: 'bytes' },
  { key: 'unpackedBytes', label: 'Unpacked package', format: 'bytes' },
  { key: 'javascriptGzipBytes', label: 'JavaScript gzip total', format: 'bytes' },
  { key: 'cssBrotliBytes', label: 'CSS Brotli total', format: 'bytes' },
  { key: 'imageAssetBytes', label: 'Image assets', format: 'bytes' },
  { key: 'largestImageAssetBytes', label: 'Largest image asset', format: 'bytes' },
  { key: 'fileCount', label: 'Package file count', format: 'integer' }
] as const;

export type MetricKey = (typeof metricDefinitions)[number]['key'];
export type MetricFormat = (typeof metricDefinitions)[number]['format'];
export type PackageSizeMetrics = Readonly<Record<MetricKey, number>>;
export type EvaluationStatus = 'pass' | 'warn' | 'fail';

export interface PackageSizeBudget {
  readonly schemaVersion: 'zdp.package-size-budget/v1';
  readonly warnAtPercent: number;
  readonly baseline: {
    readonly strategy: 'published-same-version-or-latest';
    readonly required: boolean;
  };
  readonly limits: Readonly<Record<MetricKey, number>>;
}

export interface FileMeasurement {
  readonly path: string;
  readonly bytes: number;
}

export interface PackageMeasurement {
  readonly packageName: string;
  readonly packageVersion: string;
  readonly source: string;
  readonly metrics: PackageSizeMetrics;
  readonly largestFiles: readonly FileMeasurement[];
}

export interface MetricEvaluation {
  readonly key: MetricKey;
  readonly label: string;
  readonly format: MetricFormat;
  readonly current: number;
  readonly baseline: number | null;
  readonly delta: number | null;
  readonly deltaPercent: number | null;
  readonly limit: number;
  readonly usedPercent: number;
  readonly status: EvaluationStatus;
}

export interface BaselineResult {
  readonly measurement: PackageMeasurement | null;
  readonly note: string | null;
}
