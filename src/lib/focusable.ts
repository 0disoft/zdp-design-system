export const zdpFocusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  'details > summary:first-of-type',
  '[contenteditable="true"]',
  '[tabindex]'
].join(', ');

export function isZdpFocusableElement(element: HTMLElement): boolean {
  if (element.tabIndex < 0) {
    return false;
  }

  if (element.matches('[disabled], [hidden], [aria-hidden="true"]')) {
    return false;
  }

  if (element.closest('[hidden], [aria-hidden="true"], [inert]') !== null) {
    return false;
  }

  const style = window.getComputedStyle(element);

  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return element.getClientRects().length > 0;
}
