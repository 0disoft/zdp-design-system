import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zdpShareIcons } from '../src/lib/share';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const shareJsPath = resolve(repoRoot, 'share.js');
const shareTypesPath = resolve(repoRoot, 'share.d.ts');
const checkOnly = process.argv.includes('--check');

function renderShareJavaScript(): string {
  return `export const zdpShareIcons = ${JSON.stringify(zdpShareIcons, null, 2)};\n`;
}

function renderShareTypes(): string {
  return `export type ZdpShareIconName = 'copy' | 'device' | 'telegram' | 'line' | 'whatsapp' | 'x' | 'reddit';

export interface ZdpShareIconPath {
  readonly d: string;
  readonly fill?: boolean;
  readonly stroke?: boolean;
  readonly strokeLinecap?: 'round';
  readonly strokeLinejoin?: 'round';
  readonly strokeWidth?: string;
}

export interface ZdpShareIconCircle {
  readonly cx: string;
  readonly cy: string;
  readonly r: string;
  readonly fill?: boolean;
  readonly stroke?: boolean;
  readonly strokeWidth?: string;
}

export interface ZdpShareIconLine {
  readonly x1: string;
  readonly y1: string;
  readonly x2: string;
  readonly y2: string;
  readonly strokeWidth?: string;
}

export interface ZdpShareIconShape {
  readonly viewBox: string;
  readonly paths?: readonly ZdpShareIconPath[];
  readonly circles?: readonly ZdpShareIconCircle[];
  readonly lines?: readonly ZdpShareIconLine[];
}

export interface ZdpShareDockItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ZdpShareIconName;
  readonly href?: string;
  readonly target?: '_blank' | '_self' | '_parent' | '_top';
  readonly rel?: string;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly onclick?: (event: MouseEvent, item: ZdpShareDockItem) => void;
}

export declare const zdpShareIcons: Record<ZdpShareIconName, ZdpShareIconShape>;
`;
}

async function assertSynced(path: string, expected: string): Promise<boolean> {
  const current = await readFile(path, 'utf8');

  if (current === expected) {
    return true;
  }

  console.error(`${path} is out of sync with src/lib/share.ts. Run \`bun run share-icons:generate\`.`);
  return false;
}

const outputs = [
  [shareJsPath, renderShareJavaScript()],
  [shareTypesPath, renderShareTypes()]
] as const;

if (checkOnly) {
  const results = await Promise.all(outputs.map(([path, content]) => assertSynced(path, content)));

  if (results.includes(false)) {
    process.exit(1);
  }
} else {
  await Promise.all(outputs.map(([path, content]) => writeFile(path, content)));
}
