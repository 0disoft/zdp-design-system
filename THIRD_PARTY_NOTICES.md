# Third Party Notices

This repository may review external UI libraries as behavior references, pattern catalogs, or implementation candidates.
External sources are not automatically copied into `zdp-design-system`.

## Current Adapted Source

No third-party source code is currently copied or adapted into the package source.

## Review Sources

The following projects may be reviewed as references under the rules in `docs/EXTERNAL_UI_ADOPTION.md`.
Reference review does not mean source code has been copied.

| Source | License | Allowed Use In ZDP |
| --- | --- | --- |
| shadcn-svelte | MIT | Behavior and accessibility reference for Svelte primitives. |
| Bits UI | MIT | Candidate internal headless implementation for high-risk interactive primitives. |
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

If any third-party source code is copied, ported, or meaningfully adapted later, update this file in the same change.
Record the source URL, license, component, adoption grade, and local files affected.
