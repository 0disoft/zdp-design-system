# Package Surface Checklist

- `scripts/public-surface.ts` is the source of truth for public components, helper exports, package subpaths, and generated surface documentation.
- `bun run surface:check` confirms `src/lib/index.ts`, `package.json` exports, and `docs/PUBLIC_SURFACE.md` have no drift.
- Brand and credit asset exports derive from their manifest `packagePath` values instead of a second hand-maintained list.
- Exports resolve to `dist/**`.
- Consumers do not deep import `src/**`.
- `files` allowlist includes only intended package artifacts.
- `sideEffects` includes intended CSS entries.
- Package build and check scripts agree on generated token, share icon, component, CSS, and docs surfaces.
- Package version impact is evaluated when packaged files change.
