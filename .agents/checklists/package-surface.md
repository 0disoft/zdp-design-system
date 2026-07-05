# Package Surface Checklist

- Exports resolve to `dist/**`.
- Consumers do not deep import `src/**`.
- `files` allowlist includes only intended package artifacts.
- `sideEffects` includes intended CSS entries.
- Package build and check scripts agree on generated token, share icon, component, CSS, and docs surfaces.
- Package version impact is evaluated when packaged files change.
