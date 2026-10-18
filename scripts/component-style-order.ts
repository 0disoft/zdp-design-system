import assert from 'node:assert/strict';
import type { PublicComponentExport } from './component-style-entries';

// Preserve the shared stylesheet's cascade, independently of alphabetical exports.
// Register each new public component here; its CSS still lives only in its <style>.
const componentStyleOrder = [
  'ConfirmAction', 'Badge', 'Avatar', 'IdentityChip', 'Link', 'SkipLink', 'VisuallyHidden',
  'Page', 'Container', 'Section', 'PageHeader', 'Card', 'CardHeader', 'Stack', 'Inline',
  'Grid', 'Toolbar', 'Kbd', 'InlineCode', 'ShortcutHint', 'Tooltip', 'Accordion',
  'SegmentedControl', 'Popover', 'Button', 'IconButton', 'Icon', 'Disclosure', 'Menu',
  'Divider', 'ThemeToggle', 'LocaleSwitcher', 'TextScaleControl', 'Field', 'HelpText',
  'Label', 'Input', 'Textarea', 'ErrorText', 'Checkbox', 'Radio', 'Switch', 'Select',
  'Combobox', 'CommandField', 'Callout', 'Toast', 'StatusToast', 'Progress', 'Spinner',
  'Skeleton', 'Breadcrumb', 'Pagination', 'Table', 'SortHeader', 'TableToolbar',
  'KeyValue', 'EmptyState', 'Tabs', 'CodeBlock', 'TermTrigger', 'TermSheet', 'Sheet',
  'Dialog', 'Surface', 'ShareDock', 'AdSlot', 'ResizableSplitPane'
] as const;

export function orderComponentStyles(
  components: readonly PublicComponentExport[]
): readonly PublicComponentExport[] {
  assert.equal(new Set(componentStyleOrder).size, componentStyleOrder.length,
    'Component CSS cascade order must not contain duplicates.');
  assert.deepEqual(components.map(({ name }) => name).sort(), [...componentStyleOrder].sort(),
    'Register every public component exactly once in component-style-order.ts.');
  const byName = new Map(components.map(component => [component.name, component]));
  return componentStyleOrder.map(name => byName.get(name)!);
}
