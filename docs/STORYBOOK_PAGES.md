# Storybook Pages operations

## Published surface

A successful `main` CI run publishes the current Storybook at `https://0disoft.github.io/zdp-design-system/`. A successful same-repository pull request CI run publishes an isolated preview at `https://0disoft.github.io/zdp-design-system/pr-preview/pr-<number>/` and updates one sticky pull request comment. Closing the pull request removes that directory and marks the comment as removed.

The generated `gh-pages` branch is deployment output. Do not edit it by hand. Main deployments replace the root Storybook while preserving `pr-preview/` and an existing `CNAME`. Pull request deployments replace only their own numbered directory. A repository-wide concurrency group serializes all writes to the branch.

## One-time activation

After this change reaches `main` and the first successful visual CI run creates `gh-pages`, verify repository Settings → Pages. If Pages is not enabled, select **Deploy from a branch**, choose `gh-pages`, choose `/ (root)`, and save.

The workflow deliberately does not attempt to enable Pages through `GITHUB_TOKEN`. Until activation, preview comments use the eventual default Pages URL and state that Pages is not enabled. Runs without a fresh Storybook artifact are recorded as skipped instead of failing or republishing stale output.

## Security boundary

The build workflow keeps `contents: read`, runs the repository checks, builds Storybook, and uploads only the resulting static directory. The publishing workflow is triggered with `workflow_run`, checks out deployment code from `main`, downloads the artifact from the exact successful run ID, and never executes JavaScript from that artifact.

Trusted `workflow_run` fields select either the root site or a numbered pull request directory. The publisher accepts only successful `main` pushes and same-repository pull requests, verifies that a pull request is still open immediately before publishing, validates the commit SHA and pull request number formats, and rejects symbolic links or non-regular filesystem entries. Fork pull request previews are intentionally skipped because they would serve untrusted JavaScript under the repository Pages origin.

The cleanup workflow uses `pull_request_target` only for the `closed` event, checks out `main`, and never checks out or executes pull request code. It receives only the permissions required to update `gh-pages` and the existing preview comment.

## Recovery

Rerun the failed `zdp-design-system` workflow to rebuild and republish a main or pull request preview. A successful rerun is idempotent; unchanged output produces no new `gh-pages` commit. If a stale preview remains after an interrupted close event, reopen and close the pull request once, or remove only its `pr-preview/pr-<number>/` directory from `gh-pages` and leave the root Storybook intact.
