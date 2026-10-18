# Third Party Notices

This repository may review external UI libraries as behavior references, pattern catalogs, or implementation candidates.
External sources are not automatically copied into `zdp-design-system`.

## Current Adapted Material

The package keeps exact third-party brand icon path data where substituting a custom glyph would
misrepresent the platform brand.

| Source | License | Material And Adoption Grade | Local Files |
| --- | --- | --- | --- |
| [Simple Icons](https://github.com/simple-icons/simple-icons), package snapshot 16.23.0 | CC0-1.0 | Exact SVG path data for Telegram, LINE, WhatsApp, X, Reddit, Facebook, Threads, Bluesky, and Sina Weibo; LinkedIn glyph vendored from simple-icons 13.21.0 (CC0-1.0); Source Adapted. | `src/lib/share.ts`; generated `share.js` and `dist/share.js`. |

`scripts/check-share-icons.ts` compares these five paths with the installed Simple Icons package so
the copied data cannot silently drift into custom approximations. The CC0 license does not grant
trademark rights; consuming applications remain responsible for using each brand appropriately.

## Runtime Dependencies

The package installs these packages as runtime dependencies. They are used only behind ZDP-owned component
APIs, and their types, prop names, class names, and stores are not part of the public export.

| Source | Version | License | Copyright | Adoption Grade | Local Usage |
| --- | --- | --- | --- | --- | --- |
| [Floating UI](https://github.com/floating-ui/floating-ui) | 1.8.0 | MIT | Copyright (c) 2021-present Floating UI contributors | Runtime Dependency | `src/lib/floating-position.ts` uses the public DOM positioning API for Menu, Popover, Combobox, and Tooltip. No external source is copied. |

`docs/EXTERNAL_UI_ADOPTION.md` owns the runtime dependency adoption criteria.

## Review Sources

The following projects may be reviewed as references under the rules in `docs/EXTERNAL_UI_ADOPTION.md`.
Reference review does not mean source code has been copied.

| Source | License | Allowed Use In ZDP |
| --- | --- | --- |
| Bits UI | MIT | Behavior and accessibility reference; the runtime dependency was removed. |
| shadcn-svelte | MIT | Behavior and accessibility reference for Svelte primitives. |
| Skeleton | MIT | Pattern catalog only; no direct core import. |
| Flowbite Svelte | MIT | Pattern catalog only; no direct core import. |
| daisyUI | MIT | CSS/pattern reference only; no Tailwind theme dependency in core. |
| Ark UI | MIT | Long-term multi-framework headless candidate. |
| Motion | MIT | Animation engine candidate for isolated marketing recipes. |
| SmoothUI | MIT | Marketing animation recipe reference only; source-derived code must be recorded separately. |

## Prohibited Sources

Tailwind Plus and Tailwind UI source, templates, components, and derivative snippets are not used as source material for this package.
Their license terms are not a fit for a redistributable shared UI package, template, starter, or component library boundary.

## Notice Rule

If any additional third-party source code, data, or assets are copied, ported, or meaningfully adapted later, update this file in the same change.
Record the source URL, license, component, adoption grade, and local files affected.
