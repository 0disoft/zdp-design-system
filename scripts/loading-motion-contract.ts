import { parseCss, type AST } from 'svelte/compiler';

// These are functional indicators, not decorative motion. Timing and keyframe
// values live in the component styles and are exercised by browser checks.
const loadingSelectors = new Set([
  '.zdp-progress[data-indeterminate="true"] .zdp-progress__bar',
  '.zdp-spinner__mark',
  '.zdp-skeleton[data-animated="true"] .zdp-skeleton__line',
  '.zdp-button[data-loading="true"] .zdp-button__spinner',
  '.zdp-icon-button[data-loading="true"] .zdp-icon-button__spinner',
  '.zdp-confirm-action[data-pending="true"] .zdp-confirm-action__spinner',
  '.zdp-code-block__copy[data-copy-state="copying"] .zdp-code-block__copy-spinner'
]);

export function checkLoadingMotion(css: string): readonly string[] {
  const failures: string[] = [];
  const animations = new Map<string, string>();
  const reducedSelectors = new Set<string>();
  const keyframes = new Set<string>();
  const normalize = (text: string) => text.replaceAll("'", '"').replace(/\s+/g, ' ').trim();

  visit(parseCss(css).children);
  for (const [selector, name] of animations) {
    if (!keyframes.has(name)) failures.push(`Loading animation ${name} has no keyframes.`);
    if (!reducedSelectors.has(selector)) failures.push(`Loading selector ${selector} needs a reduced-motion override.`);
  }
  for (const name of keyframes) {
    if (![...animations.values()].includes(name)) failures.push(`Keyframes ${name} must belong to a loading indicator.`);
  }
  return failures;

  function visit(nodes: AST.CSS.Block['children'], reducedMotion = false): void {
    for (const node of nodes) {
      if (node.type === 'Atrule') {
        if (node.name === 'keyframes') {
          keyframes.add(node.prelude.trim());
          for (const frame of node.block?.children ?? []) {
            if (frame.type !== 'Rule') continue;
            for (const declaration of frame.block.children) {
              if (declaration.type !== 'Declaration') continue;
              const allowed = declaration.property === 'opacity'
                ? Number(declaration.value) >= 0 && Number(declaration.value) <= 1
                : declaration.property === 'transform' && /^(rotate|translateX)\([^;{}]+\)$/.test(declaration.value);
              if (!allowed) failures.push(`Loading keyframes ${node.prelude} must only rotate, translate horizontally, or change opacity.`);
            }
          }
          continue;
        }
        if (node.block) visit(node.block.children, reducedMotion ||
          (node.name === 'media' && node.prelude.replace(/\s+/g, '') === '(prefers-reduced-motion:reduce)'));
      } else if (node.type === 'Rule') {
        const selectors = node.prelude.children.map(selector => normalize(css.slice(selector.start, selector.end)));
        for (const declaration of node.block.children) {
          if (declaration.type !== 'Declaration' || !declaration.property.startsWith('animation')) continue;
          for (const selector of selectors) {
            if (!loadingSelectors.has(selector) || declaration.property !== 'animation') {
              failures.push(`Animation is not allowed on ${selector}.`);
            } else if (declaration.value.trim() === 'none' && reducedMotion) {
              reducedSelectors.add(selector);
            } else if (!reducedMotion && !declaration.value.includes(',')) {
              animations.set(selector, declaration.value.trim().split(/\s+/)[0]!);
            } else {
              failures.push(`Loading selector ${selector} must disable animation under reduced motion.`);
            }
          }
        }
        visit(node.block.children.filter(child => child.type !== 'Declaration'), reducedMotion);
      }
    }
  }
}
