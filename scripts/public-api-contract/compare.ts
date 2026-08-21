import { exportKey, parseSemver } from './package';
const releaseBumpRank: Readonly<Record<ReleaseBump, number>> = {
  patch: 0,
  minor: 1,
  major: 2
};

import type {
  ComponentContract,
  PackageExportLeaf,
  PublicApiChange,
  PublicApiComparison,
  PublicApiContract,
  ReleaseBump,
  RootExportContract
} from './types';

export function comparePublicApiContracts(base: PublicApiContract, current: PublicApiContract): PublicApiComparison {
  const changes: PublicApiChange[] = [];
  if (base.packageName !== current.packageName) {
    add(changes, 'breaking', 'package-export', `Package name changed from ${base.packageName} to ${current.packageName}.`);
  }
  comparePackageExports(base.packageExports, current.packageExports, changes);
  compareRootExports(base.rootExports, current.rootExports, changes);
  compareComponents(base.components, current.components, changes);
  compareSets(base.tokens, current.tokens, 'token', 'token', changes);
  changes.sort((a, b) => {
    const level = a.level === b.level ? 0 : a.level === 'breaking' ? -1 : 1;
    return level || a.area.localeCompare(b.area) || a.message.localeCompare(b.message);
  });
  return {
    level: changes.some((item) => item.level === 'breaking') ? 'breaking' : changes.length ? 'additive' : 'none',
    changes
  };
}

export function validateVersionForApiChange(
  baseVersion: string,
  currentVersion: string,
  level: PublicApiComparison['level'],
  releaseBump: ReleaseBump | null = null
): readonly string[] {
  const base = parseSemver(baseVersion);
  const current = parseSemver(currentVersion);
  const order = current.major - base.major || current.minor - base.minor || current.patch - base.patch;
  if (order < 0) return [`Package version regressed from ${baseVersion} to ${currentVersion}.`];
  if (level === 'none') return [];
  const sufficient = base.major === 0
    ? current.major > 0 || (current.major === 0 && current.minor > base.minor)
    : level === 'breaking'
      ? current.major > base.major
      : current.major > base.major || (current.major === base.major && current.minor > base.minor);
  if (sufficient) return [];

  const requiredBump: ReleaseBump = base.major === 0 || level === 'additive' ? 'minor' : 'major';
  if (releaseBump !== null && releaseBumpRank[releaseBump] >= releaseBumpRank[requiredBump]) {
    return [];
  }

  const requiredVersion = base.major === 0
    ? `a minor bump above ${base.major}.${base.minor}.x`
    : level === 'breaking'
      ? `a major bump above ${base.major}.x.x`
      : `a minor bump above ${base.major}.${base.minor}.x`;
  const fragment = releaseBump === null ? 'none' : releaseBump;
  return [
    `${level[0]?.toUpperCase()}${level.slice(1)} public API changes require ${requiredVersion} ` +
    `or a new/updated ${requiredBump} release fragment; found version ${currentVersion} and fragment ${fragment}.`
  ];
}

export function formatPublicApiComparison(
  base: PublicApiContract,
  current: PublicApiContract,
  comparison: PublicApiComparison
): string {
  const lines = [
    `Public API comparison: ${base.packageVersion} -> ${current.packageVersion}`,
    `Change level: ${comparison.level}`
  ];
  if (!comparison.changes.length) return [...lines, 'No public API changes detected.'].join('\n');
  for (const change of comparison.changes.slice(0, 80)) {
    lines.push(`- [${change.level}] ${change.area}: ${change.message}`);
  }
  if (comparison.changes.length > 80) lines.push(`- ... ${comparison.changes.length - 80} additional changes omitted.`);
  return lines.join('\n');
}

function comparePackageExports(
  base: readonly PackageExportLeaf[],
  current: readonly PackageExportLeaf[],
  changes: PublicApiChange[]
): void {
  const before = new Map(base.map((item) => [exportKey(item), item]));
  const after = new Map(current.map((item) => [exportKey(item), item]));
  for (const [key, oldValue] of before) {
    const next = after.get(key);
    const label = oldValue.conditions.length ? `${oldValue.exportPath} (${oldValue.conditions.join(' > ')})` : oldValue.exportPath;
    if (!next) add(changes, 'breaking', 'package-export', `Removed ${label}.`);
    else if (next.target !== oldValue.target) {
      add(changes, 'breaking', 'package-export', `Changed ${label} target from ${oldValue.target} to ${next.target}.`);
    }
  }
  for (const [key, item] of after) {
    if (!before.has(key)) add(changes, 'additive', 'package-export', `Added ${item.exportPath} -> ${item.target}.`);
  }
}

function compareRootExports(
  base: readonly RootExportContract[],
  current: readonly RootExportContract[],
  changes: PublicApiChange[]
): void {
  const key = (item: RootExportContract): string => `${item.kind}:${item.name}`;
  const before = new Map(base.map((item) => [key(item), item]));
  const after = new Map(current.map((item) => [key(item), item]));
  for (const [id, oldValue] of before) {
    const next = after.get(id);
    if (!next) {
      add(changes, 'breaking', 'root-export', `Removed ${oldValue.kind} root export ${oldValue.name}.`);
    } else if (oldValue.source !== next.source || oldValue.importedName !== next.importedName) {
      add(changes, 'breaking', 'root-export', `Changed source of root export ${oldValue.name}.`);
    } else if (oldValue.signature !== next.signature) {
      add(changes, 'breaking', 'root-export', `Changed declaration of ${oldValue.kind} root export ${oldValue.name}.`);
    }
  }
  for (const [id, item] of after) {
    if (!before.has(id)) add(changes, 'additive', 'root-export', `Added ${item.kind} root export ${item.name}.`);
  }
}

function compareComponents(
  base: readonly ComponentContract[],
  current: readonly ComponentContract[],
  changes: PublicApiChange[]
): void {
  const before = new Map(base.map((item) => [item.name, item]));
  const after = new Map(current.map((item) => [item.name, item]));
  for (const [name, oldValue] of before) {
    const next = after.get(name);
    if (!next) {
      add(changes, 'breaking', 'component', `Removed component ${name}.`);
      continue;
    }
    if (oldValue.source !== next.source) add(changes, 'breaking', 'component', `Changed component ${name} source.`);
    compareProps(oldValue, next, changes);
    compareSets(oldValue.slots, next.slots, `${name} slot`, 'component', changes);
    compareSupportingTypes(oldValue, next, changes);
  }
  for (const name of after.keys()) {
    if (!before.has(name)) add(changes, 'additive', 'component', `Added component ${name}.`);
  }
}

function compareProps(base: ComponentContract, current: ComponentContract, changes: PublicApiChange[]): void {
  const before = new Map(base.props.map((item) => [item.name, item]));
  const after = new Map(current.props.map((item) => [item.name, item]));
  for (const [name, oldValue] of before) {
    const next = after.get(name);
    if (!next) {
      add(changes, 'breaking', 'component', `Removed ${base.name}.${name} prop.`);
      continue;
    }
    if (oldValue.type !== next.type) {
      add(changes, 'breaking', 'component', `Changed ${base.name}.${name} type from ${oldValue.type} to ${next.type}.`);
    }
    if (oldValue.required !== next.required) {
      add(changes, next.required ? 'breaking' : 'additive', 'component', `${base.name}.${name} became ${next.required ? 'required' : 'optional'}.`);
    }
    if (oldValue.bindable !== next.bindable) {
      add(changes, next.bindable ? 'additive' : 'breaking', 'component', `${base.name}.${name} ${next.bindable ? 'became bindable' : 'is no longer bindable'}.`);
    }
    if (oldValue.defaultValue !== next.defaultValue) {
      add(changes, 'breaking', 'component', `Changed ${base.name}.${name} default from ${oldValue.defaultValue ?? '<none>'} to ${next.defaultValue ?? '<none>'}.`);
    }
  }
  for (const [name, item] of after) {
    if (!before.has(name)) {
      add(changes, item.required ? 'breaking' : 'additive', 'component', `Added ${current.name}.${name} ${item.required ? 'required' : 'optional'} prop.`);
    }
  }
}

function compareSupportingTypes(base: ComponentContract, current: ComponentContract, changes: PublicApiChange[]): void {
  const before = new Map(base.typeDeclarations.map((item) => [item.name, item.declaration]));
  const after = new Map(current.typeDeclarations.map((item) => [item.name, item.declaration]));
  for (const [name, declaration] of before) {
    const next = after.get(name);
    if (next === undefined) add(changes, 'breaking', 'component', `Removed ${base.name} supporting type ${name}.`);
    else if (next !== declaration) add(changes, 'breaking', 'component', `Changed ${base.name} supporting type ${name}.`);
  }
  for (const name of after.keys()) {
    if (!before.has(name)) add(changes, 'additive', 'component', `Added ${current.name} supporting type ${name}.`);
  }
}

function compareSets(
  base: readonly string[],
  current: readonly string[],
  label: string,
  area: PublicApiChange['area'],
  changes: PublicApiChange[]
): void {
  const before = new Set(base);
  const after = new Set(current);
  for (const value of before) {
    if (!after.has(value)) add(changes, 'breaking', area, `Removed ${label} ${value}.`);
  }
  for (const value of after) {
    if (!before.has(value)) add(changes, 'additive', area, `Added ${label} ${value}.`);
  }
}

function add(
  changes: PublicApiChange[],
  level: PublicApiChange['level'],
  area: PublicApiChange['area'],
  message: string
): void {
  changes.push({ level, area, message });
}
