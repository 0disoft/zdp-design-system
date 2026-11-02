---
bump: patch
---

- Stop Storybook preview URL resolution on GitHub API outages or invalid metadata instead of silently replacing custom domains with a guessed address. Reuse bounded GET retries with preserved causes and cancellation; retain the default URL fallback only for HTTP 404.
