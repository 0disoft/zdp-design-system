import { siLine, siReddit, siTelegram, siWhatsapp, siX } from 'simple-icons';
import { zdpShareIcons, type ZdpShareIconName, type ZdpShareIconShape } from '../src/lib/share';

const brandIcons = [
  ['telegram', siTelegram],
  ['line', siLine],
  ['whatsapp', siWhatsapp],
  ['x', siX],
  ['reddit', siReddit]
] as const satisfies readonly [
  ZdpShareIconName,
  { readonly title: string; readonly path: string }
][];

const failures: string[] = [];

for (const [name, simpleIcon] of brandIcons) {
  assertSimpleBrandIcon(name, zdpShareIcons[name], simpleIcon.path);
}

if (failures.length > 0) {
  throw new Error(`Share icon check failed:\n- ${failures.join('\n- ')}`);
}

console.log('Share icon check passed.');

function assertSimpleBrandIcon(
  name: ZdpShareIconName,
  icon: ZdpShareIconShape,
  expectedPath: string
): void {
  if (icon.viewBox !== '0 0 24 24') {
    failures.push(`${name} must keep the Simple Icons 0 0 24 24 viewBox.`);
  }

  if (icon.paths?.length !== 1) {
    failures.push(`${name} must use exactly one Simple Icons path.`);
    return;
  }

  if (icon.circles?.length) {
    failures.push(`${name} must not add custom circles on top of the Simple Icons path.`);
  }

  if (icon.lines?.length) {
    failures.push(`${name} must not add custom lines on top of the Simple Icons path.`);
  }

  const [path] = icon.paths;

  if (path.d !== expectedPath) {
    failures.push(`${name} path must match simple-icons exactly.`);
  }

  if (path.fill === false || path.stroke) {
    failures.push(`${name} must render as a filled brand glyph, not a custom outline icon.`);
  }
}
