import { readFile } from 'node:fs/promises';

import { join } from 'node:path';

export async function loadPreviewContext() {
const root = process.cwd();

const previewPath = join(root, 'preview', 'index.html');

const styleEntryPath = join(root, 'src', 'styles', 'index.css');

const tokenStylePath = join(root, 'src', 'styles', 'tokens.css');

const brandFontStylePath = join(root, 'src', 'styles', 'brand-fonts.css');

const expressiveFontStylePath = join(root, 'src', 'styles', 'expressive-fonts.css');

const localeFontStylePath = join(root, 'src', 'styles', 'locale-fonts.css');

const componentStylePath = join(root, 'src', 'styles', 'components.css');

const failures: string[] = [];

const [preview, styleEntry, tokenStyle, brandFontStyle, expressiveFontStyle, localeFontStyle, componentStyle] = await Promise.all([
  readFile(previewPath, 'utf8'),
  readFile(styleEntryPath, 'utf8'),
  readFile(tokenStylePath, 'utf8'),
  readFile(brandFontStylePath, 'utf8'),
  readFile(expressiveFontStylePath, 'utf8'),
  readFile(localeFontStylePath, 'utf8'),
  readFile(componentStylePath, 'utf8')
]);
return { preview, styleEntry, tokenStyle, brandFontStyle, expressiveFontStyle, localeFontStyle, componentStyle, failures };
}

export type PreviewCheckContext = Awaited<ReturnType<typeof loadPreviewContext>>;
