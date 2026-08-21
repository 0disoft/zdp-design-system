# Release change fragments

Every pull request that changes the published package, public component behavior, CSS contract, assets, or release tooling adds one Markdown fragment in this directory. Documentation-only and repository-internal maintenance changes do not need a fragment unless they affect packaged files or consumers.

Create a fragment with:

```sh
bun run release:change:add patch command-field-clear
```

Then replace the generated placeholder. Filenames use lowercase kebab case and each fragment has this exact structure:

```md
---
bump: patch
---

- Fixed the consumer-visible behavior in one concise changelog entry.
```

Use `bump: patch` for compatible fixes and internal release-tooling changes. Use `bump: minor` for compatible public features and for intentional pre-1.0 breaking changes that advance the minor version. Use `bump: major` only when the package is ready to cross a stable major boundary.

After fragments land on `main`, `.github/workflows/release-pr.yml` regenerates the generated `release/zdp-design-system` branch from the latest `main`, selects the highest requested bump, updates `package.json` and `CHANGELOG.md`, deletes the consumed fragments, and opens or refreshes one release pull request. The generated branch is disposable and must not contain hand-written commits.

Merging the release pull request only prepares the version. Publishing still requires an explicit matching `v<version>` tag, after which `publish-npm.yml` performs the existing OIDC and artifact-integrity checks.
