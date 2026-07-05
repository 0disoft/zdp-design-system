# Design System Contract Validation

Before reporting completion, verify:

- Tokens, CSS variables, generated surfaces, and docs describe the same contract.
- Components do not own product authority or data decisions.
- Package exports point to `dist/**` and consumers can stay on public exports.
- Storybook, preview, fixtures, and a11y gates still cover the changed surface.
- External UI adoption rules and third-party notices stay aligned when external code or dependencies change.
- Package version impact is named when packaged files change.
