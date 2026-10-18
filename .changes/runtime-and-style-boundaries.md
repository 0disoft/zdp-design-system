---
bump: minor
---

- Migrate the remaining components to Svelte 5 Runes with snippet and callback props. Consumers should use Svelte 5 snippet props for named content and callback props such as `oninput` instead of legacy component event directives. Share Dialog, Sheet and TermSheet focus trapping, restoration and transition cancellation so closing before the next tick cannot move focus into a closed modal.
- Share Floating UI positioning and clipping boundaries across Combobox, Tooltip, Popover and Menu. Remove the Bits UI runtime dependency and its focus/dismissal workarounds while retaining ZDP keyboard, dismissal and existing-DOM placement behavior.
- Make the default `styles.css` entry compose `foundation.css` and `components.css` without CDN requests. Webfonts, including Noto Sans KR, now require the optional `locale-fonts.css` or consumer-hosted font faces. Pin the optional Noto Sans KR CDN import to 5.3.0 and keep shared forced-colors rules in foundation only.
