/** Fixed panels normally escape overflow; containing blocks restore ancestor clipping. */
export function getZdpFloatingBoundaries(anchor: HTMLElement): HTMLElement[] {
  const view = anchor.ownerDocument.defaultView;
  if (!view) return [];
  const ancestors: { element: HTMLElement; style: CSSStyleDeclaration }[] = [];
  let element = parentElement(anchor);
  while (element) {
    ancestors.push({ element, style: view.getComputedStyle(element) });
    element = parentElement(element);
  }
  const containingIndex = ancestors.findIndex(({ style }) =>
    [style.transform, style.translate, style.rotate, style.scale, style.perspective, style.filter, style.backdropFilter]
      .some(value => value && value !== 'none') ||
    /(?:paint|layout|strict|content)/.test(style.contain) ||
    /(?:transform|perspective|filter)/.test(style.willChange) || style.contentVisibility === 'auto'
  );
  if (containingIndex < 0) return [];
  return ancestors.slice(containingIndex).filter(({ style }) =>
    /(?:hidden|clip|auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`) ||
    /(?:paint|strict|content)/.test(style.contain) || style.contentVisibility === 'auto'
  ).map(({ element }) => element);
}

function parentElement(element: HTMLElement): HTMLElement | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return 'host' in root ? (root as ShadowRoot).host as HTMLElement : null;
}
