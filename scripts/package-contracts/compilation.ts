import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { compile, type Warning } from 'svelte/compiler';
import type { PackageCheckContext, PackageJson } from './context';

export function createCompilationChecks(context: PackageCheckContext) {
const { root, failures, componentPaths, defaultLocaleSourcePaths } = context;

async function checkSvelteCompilation(): Promise<void> {
  for (const relativePath of componentPaths) {
    const fullPath = join(root, relativePath);
    const source = await readFile(fullPath, 'utf8');
    const warnings: Warning[] = [];

    compile(source, {
      css: 'external',
      dev: true,
      filename: relativePath,
      generate: 'client',
      warningFilter(warning) {
        warnings.push(warning);
        return false;
      }
    });

    if (warnings.length > 0) {
      for (const warning of warnings) {
        failures.push(`${relativePath} has Svelte warning ${warning.code}: ${warning.message}`);
      }
    }
  }
}

async function checkEnglishDefaultTextContract(): Promise<void> {
  const hangulPattern = /[\uac00-\ud7af]/;

  for (const relativePath of defaultLocaleSourcePaths) {
    const source = await readFile(join(root, relativePath), 'utf8');

    if (hangulPattern.test(source)) {
      failures.push(`${relativePath} must keep component default user-facing text in English.`);
    }
  }
}

async function checkUserFacingLabelOverrideContract(): Promise<void> {
  const componentContracts: readonly {
    readonly path: string;
    readonly requiredTexts: readonly string[];
  }[] = [
    {
      path: 'src/lib/components/AdSlot.svelte',
      requiredTexts: [
        "export let label = 'Advertisement'",
        'export let fallbackText: string | null = null',
        'aria-label={label}',
        'resolvedFallbackText = fallbackText ?? label',
        '{resolvedFallbackText}'
      ]
    },
    {
      path: 'src/lib/components/CodeBlock.svelte',
      requiredTexts: [
        "export let copyLabel = 'Copy'",
        "export let copiedLabel = 'Copied'",
        "export let copyFailedLabel = 'Copy failed'",
        'copyState ===',
        '{resolvedCopyLabel}'
      ]
    },
    {
      path: 'src/lib/components/Combobox.svelte',
      requiredTexts: [
        "label = 'Search'",
        "placeholder = 'Search query'",
        "noResultsText = 'No results'",
        'const componentId = $props.id()',
        "openLabel = 'Open selection'",
        "closeLabel = 'Close selection'",
        'aria-label={open ? closeLabel : openLabel}',
        'placeholder={placeholder ?? undefined}',
        '{noResultsText}'
      ]
    },
    {
      path: 'src/lib/components/CommandField.svelte',
      requiredTexts: [
        "label = $bindable('Search')",
        "placeholder = $bindable('Search query')",
        'placeholder={placeholder ?? undefined}',
        'aria-label={inputAriaLabel}',
        "role={hasComboboxContract ? 'combobox' : undefined}",
        'aria-expanded={resolvedAriaExpanded ?? undefined}'
      ]
    },
    {
      path: 'src/lib/components/Dialog.svelte',
      requiredTexts: [
        "export let closeLabel = 'Close'",
        'aria-label={closeLabel}'
      ]
    },
    {
      path: 'src/lib/components/Pagination.svelte',
      requiredTexts: [
        "export let ariaLabel = 'Pagination'",
        "export let previousLabel = 'Previous'",
        "export let nextLabel = 'Next'",
        'export let pageLabel: (page: number) => string',
        'export let currentLabel: (page: number) => string',
        'aria-label={ariaLabel}',
        'aria-label={previousLabel}',
        'aria-label={nextLabel}',
        'aria-label={item.page === activePage ? currentLabel(item.page) : pageLabel(item.page)}'
      ]
    },
    {
      path: 'src/lib/components/Sheet.svelte',
      requiredTexts: [
        "export let closeLabel = 'Close'",
        'aria-label={closeLabel}'
      ]
    },
    {
      path: 'src/lib/components/StatusToast.svelte',
      requiredTexts: [
        "ariaLabel = 'Status notifications'",
        'const componentId = $props.id()',
        "dismissLabel={item.dismissLabel ?? 'Dismiss notification'}",
        'aria-label={labelledBy ? undefined : ariaLabel}'
      ]
    },
    {
      path: 'src/lib/components/TermSheet.svelte',
      requiredTexts: [
        "closeLabel = 'Close'",
        "eyebrow = 'Term'",
        "relatedLabel = 'Related terms'",
        "exampleLabel = 'Example'",
        'const componentId = $props.id()',
        'aria-label={closeLabel}',
        '{eyebrow}',
        'aria-label={exampleLabel}',
        'aria-label={relatedLabel}'
      ]
    },
    {
      path: 'src/lib/components/ThemeToggle.svelte',
      requiredTexts: [
        "export let lightLabel = 'Switch to light mode'",
        "export let darkLabel = 'Switch to dark mode'",
        'aria-label={ariaLabel}'
      ]
    },
    {
      path: 'src/lib/components/Toast.svelte',
      requiredTexts: [
        "export let dismissLabel = 'Dismiss notification'",
        'aria-label={dismissLabel}'
      ]
    }
  ];

  for (const contract of componentContracts) {
    const source = await readFile(join(root, contract.path), 'utf8');

    for (const requiredText of contract.requiredTexts) {
      if (!source.includes(requiredText)) {
        failures.push(`${contract.path} is missing overrideable label contract text ${requiredText}.`);
      }
    }
  }
}

return { checkSvelteCompilation, checkEnglishDefaultTextContract, checkUserFacingLabelOverrideContract };
}
