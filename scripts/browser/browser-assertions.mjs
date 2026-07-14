export async function hasInertAncestor(locator) {
  return locator.evaluate((element) => element.closest('[inert]') !== null);
}
export async function isDeepActive(locator) {
  return locator.evaluate((element) => {
    let activeElement = document.activeElement;

    while (activeElement instanceof HTMLElement && activeElement.shadowRoot?.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement === element;
  });
}
