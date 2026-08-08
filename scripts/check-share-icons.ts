import { siBluesky, siFacebook, siLine, siReddit, siSinaweibo, siTelegram, siThreads, siWhatsapp, siX } from 'simple-icons';
import { zdpShareIcons, type ZdpShareIconName, type ZdpShareIconShape } from '../src/lib/share';

const linkedInVendoredPath =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

const brandIcons = [
  ['telegram', siTelegram],
  ['line', siLine],
  ['whatsapp', siWhatsapp],
  ['x', siX],
  ['reddit', siReddit],
  ['facebook', siFacebook],
  ['threads', siThreads],
  ['bluesky', siBluesky],
  ['weibo', siSinaweibo]
] as const satisfies readonly [
  ZdpShareIconName,
  { readonly title: string; readonly path: string }
][];

const failures: string[] = [];

for (const [name, simpleIcon] of brandIcons) {
  assertSimpleBrandIcon(name, zdpShareIcons[name], simpleIcon.path);
}

// LinkedIn was removed from simple-icons (Microsoft takedown); the vendored
// simple-icons 13.21.0 glyph must stay in sync with src/lib/share.ts.
assertSimpleBrandIcon('linkedin', zdpShareIcons.linkedin, linkedInVendoredPath);

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
