import { posix } from 'node:path';
import { expectedPackageExports, type PackageExportNode } from './public-surface';

export { expectedPackageExports } from './public-surface';

export const expectedPackageExportTargets = Object.freeze(
  [...new Set(collectExportTargets(expectedPackageExports))].filter((target) => !target.includes('*'))
);

export function validatePackageExports(exportsValue: unknown): readonly string[] {
  const failures: string[] = [];

  validateExactExportNode(exportsValue, expectedPackageExports, 'package.json exports', failures);
  validateExportLeaves(exportsValue, 'package.json exports', failures);

  return failures;
}

function validateExactExportNode(
  actual: unknown,
  expected: PackageExportNode,
  location: string,
  failures: string[]
): void {
  if (typeof expected === 'string') {
    if (actual !== expected) {
      failures.push(`${location} must be ${expected}.`);
    }

    return;
  }

  if (!isRecord(actual)) {
    failures.push(`${location} must be an object.`);
    return;
  }

  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);

  for (const key of expectedKeys) {
    if (!Object.hasOwn(actual, key)) {
      failures.push(`${formatExportLocation(location, key)} is required.`);
      continue;
    }

    const expectedNode = expected[key];
    if (expectedNode === undefined) {
      failures.push(`${formatExportLocation(location, key)} has an invalid undefined expectation.`);
      continue;
    }

    validateExactExportNode(actual[key], expectedNode, formatExportLocation(location, key), failures);
  }

  for (const key of actualKeys.filter((key) => !Object.hasOwn(expected, key)).sort()) {
    failures.push(`${formatExportLocation(location, key)} is not an intended public export.`);
  }
}

function validateExportLeaves(value: unknown, location: string, failures: string[]): void {
  if (typeof value === 'string') {
    if (!isDistPackageTarget(value)) {
      failures.push(`${location} target ${value} must resolve under ./dist/**.`);
    }

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const key of Object.keys(value).sort()) {
    validateExportLeaves(value[key], formatExportLocation(location, key), failures);
  }
}

function collectExportTargets(node: PackageExportNode): string[] {
  if (typeof node === 'string') {
    return [node];
  }

  return Object.values(node).flatMap((child) => collectExportTargets(child));
}

function isDistPackageTarget(target: string): boolean {
  if (!target.startsWith('./dist/') || target.includes('\\')) {
    return false;
  }

  return posix.normalize(target.slice(2)).startsWith('dist/');
}

function formatExportLocation(parent: string, key: string): string {
  return `${parent}[${JSON.stringify(key)}]`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
