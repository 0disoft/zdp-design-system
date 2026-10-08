import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { verifySplitPointerOwnership } from './browser/check-split-pointer.mjs';
import { verifyFoundationAndFormContracts, verifyProgressRangeContracts } from './browser/check-foundation-and-forms.mjs';
import { verifyAsyncSelectResetContracts, verifyFormResetContracts, verifyNativeInputContracts } from './browser/check-native-inputs.mjs';
import { verifyComboboxEditingContracts, verifyComboboxSelectionContracts } from './browser/check-combobox-selection.mjs';
import { verifyChangingConfirmDurationContracts, verifyConfirmCompositionContracts, verifyConfirmDurationContracts, verifyConfirmRepeatContracts, verifyTouchConfirmContracts, verifyCopyLifecycleContracts } from './browser/check-action-lifecycles.mjs';
import { verifyEmptyTooltipContracts } from './browser/check-empty-tooltip.mjs';
import { verifyTooltipLifecycleContracts } from './browser/check-tooltip-lifecycle.mjs';
import { verifyToastDismissFocusContracts } from './browser/check-toast-focus.mjs';
import { verifyDisclosureFocusContracts } from './browser/check-disclosure-focus.mjs';
import { verifyPopoverFocusContracts } from './browser/check-popover-focus.mjs';
import { verifyPopoverGeometryContracts } from './browser/check-popover-geometry.mjs';
import { verifyLocalizedSortContracts, verifySortNameContracts, verifyTableDensityContracts } from './browser/check-table-interaction.mjs';
import { verifyCommandFieldContracts } from './browser/check-command-field.mjs';
import { verifyMovedFormResetContracts, verifyReassociatedFormResetContracts, verifyShadowFormResetContracts } from './browser/check-shadow-form-reset.mjs';
import { verifyShortcutEditingContracts } from './browser/check-shortcuts.mjs';
import { verifyModalContracts, verifyNestedModalContracts } from './browser/check-modals.mjs';
import { verifyShadowFocusContracts } from './browser/check-shadow-focus.mjs';
import { verifyModalMutationContracts } from './browser/check-modal-mutations.mjs';
import { verifyImeOverlayContracts } from './browser/check-ime-overlays.mjs';
import { verifySelectionFocusContracts } from './browser/check-selection-focus.mjs';
import { verifyDynamicTabsContracts, verifyRemovedTabFocusContracts, verifyTabPanelFocusContracts } from './browser/check-dynamic-tabs.mjs';
import { verifyDynamicPaginationContracts, verifyPaginationBoundsContracts } from './browser/check-dynamic-pagination.mjs';
import { verifyDynamicMenuContracts } from './browser/check-dynamic-menu.mjs';
import { verifyResponsiveFocusContracts } from './browser/check-responsive-focus.mjs';
import { verifyAccordionInstanceContracts } from './browser/check-accordion-instances.mjs';
import { verifyAvatarFallbackContracts } from './browser/check-avatar-fallback.mjs';
import { verifyFrameRovingContracts } from './browser/check-frame-roving.mjs';
import { verifyReservedNavigationContracts } from './browser/check-reserved-navigation.mjs';
import { verifyToastStackOverflowContracts, verifyToastTitleOverflowContracts } from './browser/check-toast-overflow.mjs';
import { verifyThemeToggleActionContracts } from './browser/check-theme-toggle.mjs';
import { verifyCodeMetadataOverflowContracts } from './browser/check-code-metadata.mjs';
import { verifyLocaleOverflowContracts } from './browser/check-locale-overflow.mjs';
import { verifyPageHeaderTypeContracts } from './browser/check-page-header-type.mjs';
import { verifyFrameModalContracts } from './browser/check-frame-modals.mjs';
import { verifyFramePopoverContracts } from './browser/check-frame-popover.mjs';
import { verifyTooltipHoverContracts } from './browser/check-tooltip-hover.mjs';
import { verifyOverlayContracts, verifyShadowOverlayContracts } from './browser/check-overlays.mjs';
import { verifyPageGutterContracts } from './browser/check-page-gutters.mjs';
import { verifyResponsiveAndForcedColorContracts } from './browser/check-responsive-and-forced-colors.mjs';

const root = process.cwd();
const cacheDir = await mkdtemp(join(tmpdir(), 'zdp-design-system-browser-'));
const server = await createServer({
  cacheDir,
  configFile: false,
  logLevel: 'error',
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [svelte()],
  root: join(root, 'tests/browser'),
  server: {
    hmr: false,
    host: '127.0.0.1',
    port: 0,
    strictPort: false
  }
});

let browser;

try {
  await server.listen();
  const address = server.httpServer?.address();
  assert.ok(address && typeof address === 'object', 'Vite browser fixture server must expose a listening address.');

  browser = await chromium.launch({
    channel: process.env.ZDP_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    timeout: 30_000
  });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const originalAddEventListener = Document.prototype.addEventListener;
    const originalRemoveEventListener = Document.prototype.removeEventListener;
    const captureListeners = {
      click: new Set(),
      keydown: new Set()
    };

    Document.prototype.addEventListener = function (type, listener, options) {
      const capture = options === true || (typeof options === 'object' && options?.capture === true);
      if (this === document && capture && (type === 'click' || type === 'keydown')) {
        captureListeners[type].add(listener);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
    Document.prototype.removeEventListener = function (type, listener, options) {
      const capture = options === true || (typeof options === 'object' && options?.capture === true);
      if (this === document && capture && (type === 'click' || type === 'keydown')) {
        captureListeners[type].delete(listener);
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };
    window.__zdpDismissListenerCounts = () => ({
      click: captureListeners.click.size,
      keydown: captureListeners.keydown.size
    });
  });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(30_000);
  const baseUrl = `http://127.0.0.1:${address.port}`;
  await page.goto(baseUrl, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded'
  });

  await verifyFoundationAndFormContracts(page);
  await verifyProgressRangeContracts(page);
  await verifySplitPointerOwnership(page);
  await verifyNativeInputContracts(page);
  await verifyFormResetContracts(page);
  await verifyShadowFormResetContracts(page);
  await verifyMovedFormResetContracts(page);
  await verifyReassociatedFormResetContracts(page);
  await verifyCommandFieldContracts(page);
  await verifyTableDensityContracts(page);
  await verifySortNameContracts(page);
  await verifyLocalizedSortContracts(page);
  await verifyPopoverGeometryContracts(page);
  await verifyEmptyTooltipContracts(page);
  await verifyTooltipLifecycleContracts(page);
  await verifyToastDismissFocusContracts(page);
  await verifyAsyncSelectResetContracts(page);
  await verifyComboboxSelectionContracts(page);
  await verifyComboboxEditingContracts(page);
  await verifyConfirmCompositionContracts(page);
  await verifyConfirmRepeatContracts(page);
  await verifyTouchConfirmContracts(page);
  await verifyConfirmDurationContracts(page);
  await verifyChangingConfirmDurationContracts(page);
  await verifyCopyLifecycleContracts(page);
  await verifyShortcutEditingContracts(page);
  await verifyOverlayContracts(page);
  await verifyModalContracts(page);
  await verifyModalMutationContracts(page);
  await verifyShadowFocusContracts(page);
  await verifyImeOverlayContracts(page);
  await verifyDynamicMenuContracts(page);
  await verifyDynamicPaginationContracts(page);
  await verifyPaginationBoundsContracts(page);
  await verifySelectionFocusContracts(page);
  await verifyDynamicTabsContracts(page);
  await verifyRemovedTabFocusContracts(page);
  await verifyTabPanelFocusContracts(page);
  await verifyDisclosureFocusContracts(page);
  await verifyPopoverFocusContracts(page);
  await verifyResponsiveFocusContracts(page);
  await verifyAccordionInstanceContracts(page);
  await verifyFramePopoverContracts(page);
  await verifyFrameModalContracts(page);
  await verifyFrameRovingContracts(page);
  await verifyReservedNavigationContracts(page);
  await verifyToastStackOverflowContracts(page);
  await verifyToastTitleOverflowContracts(page);
  await verifyThemeToggleActionContracts(page);
  await verifyCodeMetadataOverflowContracts(page);
  await verifyLocaleOverflowContracts(page);
  await verifyPageHeaderTypeContracts(page);
  await verifyAvatarFallbackContracts(page);
  await verifyTooltipHoverContracts(page);
  await verifyShadowOverlayContracts(page);
  await verifyNestedModalContracts(page);
  await verifyResponsiveAndForcedColorContracts(page);
  await verifyPageGutterContracts(page, baseUrl);

  console.log('Design system browser accessibility check passed.');
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { force: true, recursive: true });
}
