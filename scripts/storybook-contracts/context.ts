import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface PackageJson {
  readonly scripts?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly exports?: Record<string, unknown>;
  readonly sideEffects?: readonly unknown[];
}

export async function loadStorybookContext() {
  const root = process.cwd();

  const packagePath = join(root, 'package.json');

  const mainPath = join(root, '.storybook', 'main.ts');

  const faviconPath = join(root, '.storybook', 'public', 'favicon.svg');

  const previewPath = join(root, '.storybook', 'preview.ts');

  const previewStylePath = join(root, '.storybook', 'preview.css');

  const brandFontStylePath = join(root, 'src', 'styles', 'brand-fonts.css');

  const expressiveFontStylePath = join(root, 'src', 'styles', 'expressive-fonts.css');

  const storyPath = join(root, 'stories', 'DesignSystemOverview.stories.ts');

  const componentPath = join(root, 'stories', 'DesignSystemOverview.svelte');

  const buttonsStoryPath = join(root, 'stories', 'Buttons.stories.ts');

  const buttonsComponentPath = join(root, 'stories', 'Buttons.svelte');

  const buttonPlaygroundPath = join(root, 'stories', 'ButtonPlayground.svelte');

  const dataDisplayStoryPath = join(root, 'stories', 'DataDisplay.stories.ts');

  const dataDisplayComponentPath = join(root, 'stories', 'DataDisplay.svelte');

  const feedbackStoryPath = join(root, 'stories', 'Feedback.stories.ts');

  const feedbackComponentPath = join(root, 'stories', 'Feedback.svelte');

  const formsStoryPath = join(root, 'stories', 'Forms.stories.ts');

  const formsComponentPath = join(root, 'stories', 'Forms.svelte');

  const interactionStoryPath = join(root, 'stories', 'Interaction.stories.ts');

  const interactionComponentPath = join(root, 'stories', 'Interaction.svelte');

  const interactionProbePath = join(root, 'stories', 'InteractionProbe.svelte');

  const layoutStoryPath = join(root, 'stories', 'Layout.stories.ts');

  const layoutComponentPath = join(root, 'stories', 'Layout.svelte');

  const navigationStoryPath = join(root, 'stories', 'Navigation.stories.ts');

  const navigationComponentPath = join(root, 'stories', 'Navigation.svelte');

  const themeLocaleStressStoryPath = join(root, 'stories', 'ThemeLocaleStress.stories.ts');

  const themeLocaleStressComponentPath = join(root, 'stories', 'ThemeLocaleStress.svelte');

  const accordionPath = join(root, 'src', 'lib', 'components', 'Accordion.svelte');

  const avatarPath = join(root, 'src', 'lib', 'components', 'Avatar.svelte');

  const badgePath = join(root, 'src', 'lib', 'components', 'Badge.svelte');

  const breadcrumbPath = join(root, 'src', 'lib', 'components', 'Breadcrumb.svelte');

  const buttonPath = join(root, 'src', 'lib', 'components', 'Button.svelte');

  const calloutPath = join(root, 'src', 'lib', 'components', 'Callout.svelte');

  const checkboxPath = join(root, 'src', 'lib', 'components', 'Checkbox.svelte');

  const codeBlockPath = join(root, 'src', 'lib', 'components', 'CodeBlock.svelte');

  const comboboxPath = join(root, 'src', 'lib', 'components', 'Combobox.svelte');

  const commandFieldPath = join(root, 'src', 'lib', 'components', 'CommandField.svelte');

  const confirmActionPath = join(root, 'src', 'lib', 'components', 'ConfirmAction.svelte');

  const containerPath = join(root, 'src', 'lib', 'components', 'Container.svelte');

  const dialogPath = join(root, 'src', 'lib', 'components', 'Dialog.svelte');

  const disclosurePath = join(root, 'src', 'lib', 'components', 'Disclosure.svelte');

  const dividerPath = join(root, 'src', 'lib', 'components', 'Divider.svelte');

  const emptyStatePath = join(root, 'src', 'lib', 'components', 'EmptyState.svelte');

  const errorTextPath = join(root, 'src', 'lib', 'components', 'ErrorText.svelte');

  const fieldPath = join(root, 'src', 'lib', 'components', 'Field.svelte');

  const gridPath = join(root, 'src', 'lib', 'components', 'Grid.svelte');

  const inputPath = join(root, 'src', 'lib', 'components', 'Input.svelte');

  const kbdPath = join(root, 'src', 'lib', 'components', 'Kbd.svelte');

  const keyValuePath = join(root, 'src', 'lib', 'components', 'KeyValue.svelte');

  const labelPath = join(root, 'src', 'lib', 'components', 'Label.svelte');

  const linkPath = join(root, 'src', 'lib', 'components', 'Link.svelte');

  const localeSwitcherPath = join(root, 'src', 'lib', 'components', 'LocaleSwitcher.svelte');

  const menuPath = join(root, 'src', 'lib', 'components', 'Menu.svelte');

  const pagePath = join(root, 'src', 'lib', 'components', 'Page.svelte');

  const pageHeaderPath = join(root, 'src', 'lib', 'components', 'PageHeader.svelte');

  const paginationPath = join(root, 'src', 'lib', 'components', 'Pagination.svelte');

  const popoverPath = join(root, 'src', 'lib', 'components', 'Popover.svelte');

  const progressPath = join(root, 'src', 'lib', 'components', 'Progress.svelte');

  const radioPath = join(root, 'src', 'lib', 'components', 'Radio.svelte');

  const sectionPath = join(root, 'src', 'lib', 'components', 'Section.svelte');

  const selectPath = join(root, 'src', 'lib', 'components', 'Select.svelte');

  const segmentedControlPath = join(root, 'src', 'lib', 'components', 'SegmentedControl.svelte');

  const shareDockPath = join(root, 'src', 'lib', 'components', 'ShareDock.svelte');

  const sheetPath = join(root, 'src', 'lib', 'components', 'Sheet.svelte');

  const shortcutHintPath = join(root, 'src', 'lib', 'components', 'ShortcutHint.svelte');

  const skeletonPath = join(root, 'src', 'lib', 'components', 'Skeleton.svelte');

  const skipLinkPath = join(root, 'src', 'lib', 'components', 'SkipLink.svelte');

  const sortHeaderPath = join(root, 'src', 'lib', 'components', 'SortHeader.svelte');

  const stackPath = join(root, 'src', 'lib', 'components', 'Stack.svelte');

  const statusToastPath = join(root, 'src', 'lib', 'components', 'StatusToast.svelte');

  const spinnerPath = join(root, 'src', 'lib', 'components', 'Spinner.svelte');

  const switchPath = join(root, 'src', 'lib', 'components', 'Switch.svelte');

  const tabsPath = join(root, 'src', 'lib', 'components', 'Tabs.svelte');

  const tablePath = join(root, 'src', 'lib', 'components', 'Table.svelte');

  const tableToolbarPath = join(root, 'src', 'lib', 'components', 'TableToolbar.svelte');

  const termSheetPath = join(root, 'src', 'lib', 'components', 'TermSheet.svelte');

  const termTriggerPath = join(root, 'src', 'lib', 'components', 'TermTrigger.svelte');

  const textareaPath = join(root, 'src', 'lib', 'components', 'Textarea.svelte');

  const textScaleControlPath = join(root, 'src', 'lib', 'components', 'TextScaleControl.svelte');

  const themeTogglePath = join(root, 'src', 'lib', 'components', 'ThemeToggle.svelte');

  const tooltipPath = join(root, 'src', 'lib', 'components', 'Tooltip.svelte');

  const toastPath = join(root, 'src', 'lib', 'components', 'Toast.svelte');

  const toolbarPath = join(root, 'src', 'lib', 'components', 'Toolbar.svelte');

  const visuallyHiddenPath = join(root, 'src', 'lib', 'components', 'VisuallyHidden.svelte');

  const iconPath = join(root, 'src', 'lib', 'components', 'Icon.svelte');

  const iconButtonPath = join(root, 'src', 'lib', 'components', 'IconButton.svelte');

  const inlinePath = join(root, 'src', 'lib', 'components', 'Inline.svelte');

  const inlineCodePath = join(root, 'src', 'lib', 'components', 'InlineCode.svelte');

  const identityChipPath = join(root, 'src', 'lib', 'components', 'IdentityChip.svelte');

  const surfacePath = join(root, 'src', 'lib', 'components', 'Surface.svelte');

  const shortcutsPath = join(root, 'src', 'lib', 'shortcuts.ts');

  const failures: string[] = [];

  const [
    packageJson,
    main,
    favicon,
    preview,
    story,
    component,
    buttonsStory,
    buttonsComponent,
    buttonPlayground,
    dataDisplayStory,
    dataDisplayComponent,
    feedbackStory,
    feedbackComponent,
    formsStory,
    formsComponent,
    interactionStory,
    interactionComponent,
    interactionProbe,
    layoutStory,
    layoutComponent,
    navigationStory,
    navigationComponent,
    themeLocaleStressStory,
    themeLocaleStressComponent,
    accordion,
    avatar,
    badge,
    breadcrumb,
    button,
    callout,
    checkbox,
    codeBlock,
    combobox,
    commandField,
    confirmAction,
    container,
    dialog,
    disclosure,
    divider,
    emptyState,
    errorText,
    field,
    grid,
    input,
    kbd,
    keyValue,
    label,
    link,
    localeSwitcher,
    menu,
    page,
    pageHeader,
    pagination,
    popover,
    progress,
    radio,
    section,
    select,
    segmentedControl,
    shareDock,
    sheet,
    shortcutHint,
    shortcuts,
    skeleton,
    tooltip,
    skipLink,
    sortHeader,
    stack,
    statusToast,
    spinner,
    switchComponent,
    tabs,
    table,
    tableToolbar,
    termSheet,
    termTrigger,
    textarea,
    textScaleControl,
    themeToggle,
    toast,
    toolbar,
    visuallyHidden,
    icon,
    iconButton,
    inline,
    inlineCode,
    identityChip,
    surface
  ] =
    await Promise.all([
      readPackageJson(packagePath),
      readFile(mainPath, 'utf8'),
      readFile(faviconPath, 'utf8'),
      readFile(previewPath, 'utf8'),
      readFile(storyPath, 'utf8'),
      readFile(componentPath, 'utf8'),
      readFile(buttonsStoryPath, 'utf8'),
      readFile(buttonsComponentPath, 'utf8'),
      readFile(buttonPlaygroundPath, 'utf8'),
      readFile(dataDisplayStoryPath, 'utf8'),
      readFile(dataDisplayComponentPath, 'utf8'),
      readFile(feedbackStoryPath, 'utf8'),
      readFile(feedbackComponentPath, 'utf8'),
      readFile(formsStoryPath, 'utf8'),
      readFile(formsComponentPath, 'utf8'),
      readFile(interactionStoryPath, 'utf8'),
      readFile(interactionComponentPath, 'utf8'),
      readFile(interactionProbePath, 'utf8'),
      readFile(layoutStoryPath, 'utf8'),
      readFile(layoutComponentPath, 'utf8'),
      readFile(navigationStoryPath, 'utf8'),
      readFile(navigationComponentPath, 'utf8'),
      readFile(themeLocaleStressStoryPath, 'utf8'),
      readFile(themeLocaleStressComponentPath, 'utf8'),
      readFile(accordionPath, 'utf8'),
      readFile(avatarPath, 'utf8'),
      readFile(badgePath, 'utf8'),
      readFile(breadcrumbPath, 'utf8'),
      readFile(buttonPath, 'utf8'),
      readFile(calloutPath, 'utf8'),
      readFile(checkboxPath, 'utf8'),
      readFile(codeBlockPath, 'utf8'),
      readFile(comboboxPath, 'utf8'),
      readFile(commandFieldPath, 'utf8'),
      readFile(confirmActionPath, 'utf8'),
      readFile(containerPath, 'utf8'),
      readFile(dialogPath, 'utf8'),
      readFile(disclosurePath, 'utf8'),
      readFile(dividerPath, 'utf8'),
      readFile(emptyStatePath, 'utf8'),
      readFile(errorTextPath, 'utf8'),
      readFile(fieldPath, 'utf8'),
      readFile(gridPath, 'utf8'),
      readFile(inputPath, 'utf8'),
      readFile(kbdPath, 'utf8'),
      readFile(keyValuePath, 'utf8'),
      readFile(labelPath, 'utf8'),
      readFile(linkPath, 'utf8'),
      readFile(localeSwitcherPath, 'utf8'),
      readFile(menuPath, 'utf8'),
      readFile(pagePath, 'utf8'),
      readFile(pageHeaderPath, 'utf8'),
      readFile(paginationPath, 'utf8'),
      readFile(popoverPath, 'utf8'),
      readFile(progressPath, 'utf8'),
      readFile(radioPath, 'utf8'),
      readFile(sectionPath, 'utf8'),
      readFile(selectPath, 'utf8'),
      readFile(segmentedControlPath, 'utf8'),
      readFile(shareDockPath, 'utf8'),
      readFile(sheetPath, 'utf8'),
      readFile(shortcutHintPath, 'utf8'),
      readFile(shortcutsPath, 'utf8'),
      readFile(skeletonPath, 'utf8'),
      readFile(tooltipPath, 'utf8'),
      readFile(skipLinkPath, 'utf8'),
      readFile(sortHeaderPath, 'utf8'),
      readFile(stackPath, 'utf8'),
      readFile(statusToastPath, 'utf8'),
      readFile(spinnerPath, 'utf8'),
      readFile(switchPath, 'utf8'),
      readFile(tabsPath, 'utf8'),
      readFile(tablePath, 'utf8'),
      readFile(tableToolbarPath, 'utf8'),
      readFile(termSheetPath, 'utf8'),
      readFile(termTriggerPath, 'utf8'),
      readFile(textareaPath, 'utf8'),
      readFile(textScaleControlPath, 'utf8'),
      readFile(themeTogglePath, 'utf8'),
      readFile(toastPath, 'utf8'),
      readFile(toolbarPath, 'utf8'),
      readFile(visuallyHiddenPath, 'utf8'),
      readFile(iconPath, 'utf8'),
      readFile(iconButtonPath, 'utf8'),
      readFile(inlinePath, 'utf8'),
      readFile(inlineCodePath, 'utf8'),
      readFile(identityChipPath, 'utf8'),
      readFile(surfacePath, 'utf8')
    ]);

  const previewStyle = await readFile(previewStylePath, 'utf8');

  const brandFontStyle = await readFile(brandFontStylePath, 'utf8');

  const expressiveFontStyle = await readFile(expressiveFontStylePath, 'utf8');

  function assertScopedSelectionBlocking(label: string, source: string): void {
    if (!source.includes('-webkit-user-select: none') || !source.includes('user-select: none')) {
      failures.push(`${label} must include prefixed and standard scoped user-select blocking for control/decorative surfaces.`);
    }
  }

  function assertNoReadableSelectionBlocking(label: string, source: string): void {
    for (const forbiddenText of [
      '.zdp-code-block__pre {\n    -webkit-user-select: none',
      '.zdp-code-block__pre {\n    user-select: none',
      '.zdp-table td {\n    -webkit-user-select: none',
      '.zdp-table td {\n    user-select: none',
      '.zdp-toast__message) {\n    -webkit-user-select: none',
      '.zdp-toast__message) {\n    user-select: none',
      '.zdp-identity-chip__label {\n    -webkit-user-select: none',
      '.zdp-identity-chip__label {\n    user-select: none',
      '.zdp-key-value dd {\n    -webkit-user-select: none',
      '.zdp-key-value dd {\n    user-select: none'
    ]) {
      if (source.includes(forbiddenText)) {
        failures.push(`${label} must remain selectable and must not include ${forbiddenText}.`);
      }
    }
  }

  async function readPackageJson(path: string): Promise<PackageJson> {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

    if (!isRecord(parsed)) {
      throw new Error('package.json must be a JSON object.');
    }

    const scripts = readOptionalStringRecord(parsed.scripts, 'scripts');
    const devDependencies = readOptionalStringRecord(parsed.devDependencies, 'devDependencies');
    return {
      ...(scripts ? { scripts } : {}),
      ...(devDependencies ? { devDependencies } : {}),
      ...(isRecord(parsed.exports) ? { exports: parsed.exports } : {}),
      ...(Array.isArray(parsed.sideEffects) ? { sideEffects: parsed.sideEffects } : {})
    };
  }

  function readOptionalStringRecord(
    value: unknown,
    path: string
  ): Record<string, string> | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!isRecord(value)) {
      throw new Error(`package.json field ${path} must be an object.`);
    }

    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry !== 'string' || entry.trim().length === 0) {
        throw new Error(`package.json field ${path}.${key} must be a non-empty string.`);
      }
    }

    return value as Record<string, string>;
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  return { failures, packageJson, main, favicon, preview, story, component, buttonsStory, buttonsComponent, buttonPlayground, dataDisplayStory, dataDisplayComponent, feedbackStory, feedbackComponent, formsStory, formsComponent, interactionStory, interactionComponent, interactionProbe, layoutStory, layoutComponent, navigationStory, navigationComponent, themeLocaleStressStory, themeLocaleStressComponent, accordion, avatar, badge, breadcrumb, button, callout, checkbox, codeBlock, combobox, commandField, confirmAction, container, dialog, disclosure, divider, emptyState, errorText, field, grid, input, kbd, keyValue, label, link, localeSwitcher, menu, page, pageHeader, pagination, popover, progress, radio, section, select, segmentedControl, shareDock, sheet, shortcutHint, shortcuts, skeleton, tooltip, skipLink, sortHeader, stack, statusToast, spinner, switchComponent, tabs, table, tableToolbar, termSheet, termTrigger, textarea, textScaleControl, themeToggle, toast, toolbar, visuallyHidden, icon, iconButton, inline, inlineCode, identityChip, surface, previewStyle, brandFontStyle, expressiveFontStyle, assertScopedSelectionBlocking, assertNoReadableSelectionBlocking };
}

export type StorybookCheckContext = Awaited<ReturnType<typeof loadStorybookContext>>;
