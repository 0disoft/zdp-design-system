import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const previewPath = join(root, 'preview', 'index.html');
const styleEntryPath = join(root, 'src', 'styles', 'index.css');
const failures: string[] = [];

const [preview, styleEntry] = await Promise.all([
  readFile(previewPath, 'utf8'),
  readFile(styleEntryPath, 'utf8')
]);

for (const importPath of ['./tokens.css', './components.css']) {
  if (!styleEntry.includes(`@import "${importPath}";`)) {
    failures.push(`Missing style entry import ${importPath}.`);
  }
}

for (const requiredText of [
  '../src/styles/index.css',
  'data-zdp-theme="light"',
  'data-zdp-theme="dark"',
  'zdp-button zdp-button--primary zdp-button--md',
  'zdp-icon-button zdp-icon-button--solid zdp-icon-button--md',
  'zdp-surface zdp-surface--panel zdp-surface--padding-lg',
  '--zdp-color-accent-primary',
  '--zdp-color-accent-success',
  '--zdp-color-accent-warning',
  '--zdp-color-accent-danger',
  '--zdp-type-body-size',
  '--zdp-breakpoint-tablet',
  '--zdp-control-height-md',
  '--zdp-i18n-overflow-wrap',
  'Foundation tokens'
]) {
  if (!preview.includes(requiredText)) {
    failures.push(`Preview is missing ${requiredText}.`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  process.exitCode = 1;
}
