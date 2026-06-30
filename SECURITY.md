# Security

`zdp-design-system` owns reusable design tokens, CSS, icons, and Svelte UI primitives. It must not become the source of truth for identity, authorization, billing, consent, admin decisions, provider scripts, or product data.

## Sensitive Values

Never add real or production-like values to source, stories, fixtures, documentation, generated package output, or examples:

- Access tokens, refresh tokens, session cookies, API keys, webhook secrets, or OAuth provider secrets
- Customer identifiers, emails, phone numbers, payment identifiers, or raw provider responses
- Internal dashboard URLs, private callback URLs, or secret-bearing URLs
- Authorization, billing, ledger, consent, credential, or admin policy decisions disguised as component helpers

## Component Boundaries

Design-system components may expose accessible structure, layout reservation, focus handling, keyboard behavior, state styling, and overrideable labels. Consuming apps own data loading, permission checks, route guards, ad provider scripts, consent gates, slot ids, analytics, billing, and product-specific copy.

`AdSlot` reserves provider-neutral space only. It must not load Google, AdSense, affiliate, analytics, or consent scripts.

`Dialog`, `Sheet`, `Menu`, `Popover`, `Toast`, `StatusToast`, and form primitives must not decide whether a user can perform an action. They only render the interaction surface.

## Reporting

Use synthetic values in public issues. If a report includes a real secret, customer data, private URL, provider payload, or security-sensitive reproduction, contact the maintainer through a private channel before posting details publicly.

