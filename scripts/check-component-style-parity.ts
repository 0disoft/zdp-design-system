import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface CssRule {
  readonly selectors: readonly string[];
  readonly declarations: ReadonlyMap<string, readonly string[]>;
  readonly conditions: readonly string[];
}

interface SelectorRule {
  readonly selector: string;
  readonly stateKey: string;
  readonly declarations: ReadonlyMap<string, readonly string[]>;
  readonly conditions: readonly string[];
}

interface ParityIssue {
  readonly component: string;
  readonly selector: string;
  readonly reason: string;
}

const statePattern =
  /:(?:hover|focus|focus-visible|focus-within|active|enabled|disabled|checked|indeterminate|read-only|read-write|required|optional|valid|invalid|user-valid|user-invalid|in-range|out-of-range|placeholder-shown|autofill|default|open|popover-open|modal|fullscreen|empty)\b|\[(?:(?:aria|data)-[^\]]+|disabled|readonly|required|open|hidden|inert)(?:=[^\]]+)?\]/;
const stateConditionPattern =
  /^@media\b[\s\S]*\((?:prefers-[\w-]+|forced-colors|inverted-colors|hover|any-hover|pointer|any-pointer|update|scripting)\s*:/;
const root = process.cwd();
const componentDirectory = join(root, 'src', 'lib', 'components');
const sharedStylePath = join(root, 'src', 'styles', 'components.css');

assertCheckerContract();

const componentFiles = (await readdir(componentDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.svelte'))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));
const sharedRules = toSelectorRules(extractCssRules(await readFile(sharedStylePath, 'utf8')));
const failures: ParityIssue[] = [];
let styledComponentCount = 0;
let stateSelectorCount = 0;

for (const componentFile of componentFiles) {
  const source = await readFile(join(componentDirectory, componentFile), 'utf8');
  const styleBlocks = [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map((match) => match[1] ?? '');

  if (styleBlocks.length === 0) {
    continue;
  }

  styledComponentCount += 1;
  const componentRules = toSelectorRules(styleBlocks.flatMap((style) => extractCssRules(style)));
  const stateRules = componentRules.filter(isStateRule);
  stateSelectorCount += stateRules.length;
  failures.push(...findParityIssues(componentFile, stateRules, sharedRules));
}

if (failures.length > 0) {
  throw new Error(
    `Component style parity check failed:\n${failures
      .map((failure) => `- ${failure.component}: ${failure.selector} (${failure.reason})`)
      .join('\n')}`
  );
}

console.log(
  `Component style parity check passed for ${stateSelectorCount} state selectors across ${styledComponentCount} styled components.`
);

function assertCheckerContract(): void {
  const widenedGlobalRules = toSelectorRules(
    extractCssRules(`.zdp-toast__action:hover { color: var(--zdp-color-ink-strong); }`)
  );
  const slottedComponentRules = toSelectorRules(
    extractCssRules(`
      .zdp-toast__body :global(.zdp-toast__action:hover) {
        color: var(--zdp-color-ink-strong);
      }
    `)
  ).filter(isStateRule);
  assert.equal(
    findParityIssues('fixture.svelte', slottedComponentRules, widenedGlobalRules).length,
    0,
    'A shared class may safely omit a non-state Svelte scoping ancestor.'
  );

  const ancestorStateRules = toSelectorRules(
    extractCssRules(`
      .zdp-field[data-disabled="true"] :global(.zdp-label) {
        opacity: 0.5;
      }
    `)
  ).filter(isStateRule);
  const unsafeWidenedRules = toSelectorRules(extractCssRules(`.zdp-label { opacity: 0.5; }`));
  assert.equal(
    findParityIssues('fixture.svelte', ancestorStateRules, unsafeWidenedRules)[0]?.reason,
    'missing shared state selector',
    'A state-bearing ancestor must remain part of the shared selector contract.'
  );

  const driftedGlobalRules = toSelectorRules(
    extractCssRules(`.zdp-toast__action:hover { color: var(--zdp-color-ink-muted); }`)
  );
  assert.equal(
    findParityIssues('fixture.svelte', slottedComponentRules, driftedGlobalRules)[0]?.reason,
    'declaration drift',
    'A matching selector with different declarations must fail parity.'
  );

  const emptyStateRules = toSelectorRules(
    extractCssRules(`.zdp-toolbar__actions:empty { display: none; }`)
  ).filter(isStateRule);
  assert.equal(emptyStateRules.length, 1, ':empty must remain part of the CSS-only state contract.');

  const reducedMotionRules = toSelectorRules(
    extractCssRules(`
      @media (prefers-reduced-motion: reduce) {
        .zdp-card--hover { transition: none; }
      }
    `)
  ).filter(isStateRule);
  const unconditionalMotionRules = toSelectorRules(
    extractCssRules(`.zdp-card--hover { transition: none; }`)
  );
  assert.equal(
    findParityIssues('fixture.svelte', reducedMotionRules, unconditionalMotionRules)[0]?.reason,
    'missing shared state selector',
    'An unconditional declaration must not satisfy a reduced-motion state contract.'
  );
  assert.equal(
    findParityIssues(
      'fixture.svelte',
      reducedMotionRules,
      toSelectorRules(
        extractCssRules(`
          @media (prefers-reduced-motion: reduce) {
            .zdp-card--hover { transition: none; }
          }
        `)
      )
    ).length,
    0,
    'Matching conditional state context and declarations must satisfy parity.'
  );
}

function findParityIssues(
  component: string,
  componentRules: readonly SelectorRule[],
  sharedRules: readonly SelectorRule[]
): readonly ParityIssue[] {
  const issues: ParityIssue[] = [];

  for (const componentRule of componentRules) {
    const candidates = sharedRules.filter(
      (sharedRule) =>
        haveSameConditions(sharedRule.conditions, componentRule.conditions) &&
        (sharedRule.selector === componentRule.selector || sharedRule.stateKey === componentRule.stateKey)
    );

    if (candidates.length === 0) {
      issues.push({
        component,
        selector: formatSelectorRule(componentRule),
        reason: 'missing shared state selector'
      });
      continue;
    }

    if (!candidates.some((candidate) => containsDeclarations(candidate.declarations, componentRule.declarations))) {
      issues.push({ component, selector: formatSelectorRule(componentRule), reason: 'declaration drift' });
    }
  }

  return issues;
}

function containsDeclarations(
  actual: ReadonlyMap<string, readonly string[]>,
  expected: ReadonlyMap<string, readonly string[]>
): boolean {
  for (const [property, expectedValues] of expected) {
    const actualValues = actual.get(property) ?? [];

    if (expectedValues.some((value) => !actualValues.includes(value))) {
      return false;
    }
  }

  return true;
}

function toSelectorRules(rules: readonly CssRule[]): readonly SelectorRule[] {
  return rules.flatMap((rule) =>
    rule.selectors.map((selector) => ({
      selector,
      stateKey: stateSelectorKey(selector),
      declarations: rule.declarations,
      conditions: rule.conditions
    }))
  );
}

function haveSameConditions(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((condition, index) => condition === right[index]);
}

function formatSelectorRule(rule: SelectorRule): string {
  return rule.conditions.length > 0 ? `${rule.conditions.join(' > ')} { ${rule.selector} }` : rule.selector;
}

function stateSelectorKey(selector: string): string {
  const lastCompoundStart = findLastCompoundStart(selector);
  const prefix = selector.slice(0, lastCompoundStart);
  const lastCompound = selector.slice(lastCompoundStart);

  if (isStateSelector(lastCompound) && !isStateSelector(prefix)) {
    return lastCompound;
  }

  return selector;
}

function findLastCompoundStart(selector: string): number {
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let quote: string | null = null;

  for (let index = selector.length - 1; index >= 0; index -= 1) {
    const character = selector[index] ?? '';

    if (quote !== null) {
      if (character === quote && selector[index - 1] !== '\\') {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === ']') bracketDepth += 1;
    else if (character === '[') bracketDepth -= 1;
    else if (character === ')') parenthesisDepth += 1;
    else if (character === '(') parenthesisDepth -= 1;
    else if (bracketDepth === 0 && parenthesisDepth === 0 && /[\s>+~]/.test(character)) {
      return index + 1;
    }
  }

  return 0;
}

function isStateSelector(selector: string): boolean {
  return statePattern.test(selector);
}

function isStateRule(rule: SelectorRule): boolean {
  return isStateSelector(rule.selector) || rule.conditions.some((condition) => stateConditionPattern.test(condition));
}

function extractCssRules(css: string): readonly CssRule[] {
  const normalizedCss = stripComments(css);
  return parseRuleRange(normalizedCss, 0, normalizedCss.length, []);
}

function parseRuleRange(
  css: string,
  start: number,
  end: number,
  conditions: readonly string[]
): readonly CssRule[] {
  const rules: CssRule[] = [];
  let statementStart = start;
  let cursor = start;

  while (cursor < end) {
    const character = css[cursor] ?? '';

    if (character === '"' || character === "'") {
      cursor = skipString(css, cursor, end);
      continue;
    }

    if (character === ';') {
      statementStart = cursor + 1;
      cursor += 1;
      continue;
    }

    if (character !== '{') {
      cursor += 1;
      continue;
    }

    const header = css.slice(statementStart, cursor).trim();
    const close = findMatchingBrace(css, cursor, end);
    const body = css.slice(cursor + 1, close);

    if (header.startsWith('@')) {
      if (!/^@(?:keyframes|-webkit-keyframes)\b/.test(header)) {
        const nestedConditions = isConditionalAtRule(header)
          ? [...conditions, normalizeCondition(header)]
          : conditions;
        rules.push(...parseRuleRange(body, 0, body.length, nestedConditions));
      }
    } else if (header.includes('.zdp-')) {
      const selectors = splitSelectors(header)
        .map(normalizeSelector)
        .filter((selector) => selector.startsWith('.zdp-'));

      if (selectors.length > 0) {
        rules.push({ selectors, declarations: parseDeclarations(body), conditions });
      }
    }

    cursor = close + 1;
    statementStart = cursor;
  }

  return rules;
}

function isConditionalAtRule(header: string): boolean {
  return /^@(?:media|supports|container|scope|starting-style)\b/.test(header);
}

function normalizeCondition(header: string): string {
  return header.replace(/\s+/g, ' ').trim();
}

function findMatchingBrace(css: string, open: number, end: number): number {
  let depth = 1;

  for (let cursor = open + 1; cursor < end; cursor += 1) {
    const character = css[cursor] ?? '';

    if (character === '"' || character === "'") {
      cursor = skipString(css, cursor, end) - 1;
      continue;
    }

    if (character === '{') depth += 1;
    else if (character === '}') depth -= 1;

    if (depth === 0) {
      return cursor;
    }
  }

  throw new Error('Unbalanced CSS braces in component style parity input.');
}

function skipString(value: string, start: number, end: number): number {
  const quote = value[start];
  let cursor = start + 1;

  while (cursor < end) {
    if (value[cursor] === quote && value[cursor - 1] !== '\\') {
      return cursor + 1;
    }
    cursor += 1;
  }

  return end;
}

function splitSelectors(selectorList: string): readonly string[] {
  const selectors: string[] = [];
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let index = 0; index < selectorList.length; index += 1) {
    const character = selectorList[index] ?? '';

    if (quote !== null) {
      if (character === quote && selectorList[index - 1] !== '\\') quote = null;
      continue;
    }

    if (character === '"' || character === "'") quote = character;
    else if (character === '[') bracketDepth += 1;
    else if (character === ']') bracketDepth -= 1;
    else if (character === '(') parenthesisDepth += 1;
    else if (character === ')') parenthesisDepth -= 1;
    else if (character === ',' && bracketDepth === 0 && parenthesisDepth === 0) {
      selectors.push(selectorList.slice(start, index));
      start = index + 1;
    }
  }

  selectors.push(selectorList.slice(start));
  return selectors;
}

function normalizeSelector(selector: string): string {
  return unwrapGlobalSelectors(selector)
    .replace(/='([^']*)'/g, '="$1"')
    .replace(/\s*([>+~])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function unwrapGlobalSelectors(selector: string): string {
  let result = selector;

  while (result.includes(':global(')) {
    const start = result.indexOf(':global(');
    const open = start + ':global'.length;
    const close = findMatchingParenthesis(result, open);
    result = `${result.slice(0, start)}${result.slice(open + 1, close)}${result.slice(close + 1)}`;
  }

  return result;
}

function findMatchingParenthesis(value: string, open: number): number {
  let depth = 1;
  let quote: string | null = null;

  for (let cursor = open + 1; cursor < value.length; cursor += 1) {
    const character = value[cursor] ?? '';

    if (quote !== null) {
      if (character === quote && value[cursor - 1] !== '\\') quote = null;
      continue;
    }

    if (character === '"' || character === "'") quote = character;
    else if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;

    if (depth === 0) return cursor;
  }

  throw new Error(`Unbalanced :global() selector: ${value}`);
}

function parseDeclarations(body: string): ReadonlyMap<string, readonly string[]> {
  const declarations = new Map<string, string[]>();

  for (const declaration of splitDeclarations(body)) {
    const colon = findDeclarationColon(declaration);

    if (colon < 0) continue;

    const property = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).replace(/\s+/g, ' ').trim();

    if (!property || !value) continue;

    const values = declarations.get(property) ?? [];
    values.push(value);
    declarations.set(property, values);
  }

  return declarations;
}

function splitDeclarations(body: string): readonly string[] {
  const declarations: string[] = [];
  let parenthesisDepth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index] ?? '';

    if (quote !== null) {
      if (character === quote && body[index - 1] !== '\\') quote = null;
      continue;
    }

    if (character === '"' || character === "'") quote = character;
    else if (character === '(') parenthesisDepth += 1;
    else if (character === ')') parenthesisDepth -= 1;
    else if (character === ';' && parenthesisDepth === 0) {
      declarations.push(body.slice(start, index));
      start = index + 1;
    }
  }

  declarations.push(body.slice(start));
  return declarations;
}

function findDeclarationColon(declaration: string): number {
  let parenthesisDepth = 0;
  let quote: string | null = null;

  for (let index = 0; index < declaration.length; index += 1) {
    const character = declaration[index] ?? '';

    if (quote !== null) {
      if (character === quote && declaration[index - 1] !== '\\') quote = null;
      continue;
    }

    if (character === '"' || character === "'") quote = character;
    else if (character === '(') parenthesisDepth += 1;
    else if (character === ')') parenthesisDepth -= 1;
    else if (character === ':' && parenthesisDepth === 0) return index;
  }

  return -1;
}

function stripComments(css: string): string {
  let result = '';
  let cursor = 0;

  while (cursor < css.length) {
    if (css[cursor] === '/' && css[cursor + 1] === '*') {
      const close = css.indexOf('*/', cursor + 2);
      cursor = close < 0 ? css.length : close + 2;
      continue;
    }

    result += css[cursor] ?? '';
    cursor += 1;
  }

  return result;
}
