# Targeted visual regression

The visual checker protects seven high-risk Storybook surfaces instead of snapshotting the entire catalog:

1. Light form controls
2. Dark form controls
3. Open light Combobox
4. Open light Menu
5. Open light Dialog
6. Open light Sheet
7. Mobile light Theme / Locale Stress fixture

## Pull request workflow

GitHub Actions builds the pull request base SHA in a temporary worktree and captures expected images into the runner temporary directory. It then compares the already-built pull request Storybook against those images on the same machine.

No PNG baseline is committed. An intentional visual change becomes the next base automatically after merge, while an accidental change produces `expected.png`, `actual.png`, `diff.png`, and `failure.txt` in the `targeted-visual-regression-report` artifact.

The gate is advisory while runner stability is being established. A detected difference emits a workflow warning but does not fail the whole job.

## Local diagnosis

Build Storybook and generate temporary expected images from the current checkout:

```sh
bun run build
node scripts/check-visual-regressions.mjs --update
```

Change the relevant code, rebuild Storybook, then compare it:

```sh
bun run build
node scripts/check-visual-regressions.mjs
```

The local images are written to `tests/visual/__snapshots__/`. The directory is ignored and must not be committed.

The checker also accepts explicit paths for CI or manual base/head comparisons:

```sh
node scripts/check-visual-regressions.mjs \
  --update \
  --storybook-root /path/to/base/storybook-static \
  --snapshot-root /tmp/zdp-visual-baseline

node scripts/check-visual-regressions.mjs \
  --storybook-root /path/to/head/storybook-static \
  --snapshot-root /tmp/zdp-visual-baseline
```

Animations, transitions, smooth scrolling, and caret rendering are disabled. The browser context fixes viewport, device scale, locale, timezone, color scheme, and reduced-motion preference. Korean rendering uses a pinned Noto Sans KR stylesheet before capture.
