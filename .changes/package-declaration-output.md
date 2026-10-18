---
bump: minor
---

- Compile the library with `@sveltejs/package` to publish `.js`/`.d.ts` modules and `.svelte`/`.svelte.d.ts` components. Add declaration-backed component subpaths and replace raw TypeScript helper type targets while preserving runtime, CSS and asset import paths.
- Adjust the package file-count budget from 260 to 360 for the declaration files (345 files measured versus 252 before). Keep every byte-size budget unchanged; the new tarball is smaller despite the additional type entries.
