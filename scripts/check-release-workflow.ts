import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const workflow = readFileSync(join(root, '.github', 'workflows', 'publish-npm.yml'), 'utf8');
const releasePrWorkflow = readFileSync(join(root, '.github', 'workflows', 'release-pr.yml'), 'utf8');
const ciWorkflow = readFileSync(join(root, '.github', 'workflows', 'design-system.yml'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  packageManager?: unknown;
  repository?: { url?: unknown };
  scripts?: Record<string, unknown>;
  version?: unknown;
};
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const serviceContract = readFileSync(join(root, 'service.yaml'), 'utf8');
const actionReferences = [...workflow.matchAll(/^\s*- uses:\s+([^\s#]+)/gm)].flatMap((match) => match[1] ? [match[1]] : []);
const releasePrActionReferences = [...releasePrWorkflow.matchAll(/^\s*- uses:\s+([^\s#]+)/gm)].flatMap(
  (match) => match[1] ? [match[1]] : []
);
const ciActionReferences = [...ciWorkflow.matchAll(/^\s*- uses:\s+([^\s#]+)/gm)].flatMap((match) => match[1] ? [match[1]] : []);

assert.equal(typeof packageJson.version, 'string', 'package.json must declare a string version.');
assert.equal(packageJson.packageManager, 'bun@1.3.14');
assert.equal(packageJson.repository?.url, 'git+https://github.com/0disoft/zdp-design-system.git');
assert.equal(packageJson.scripts?.['release:change:add'], 'bun scripts/release-changes.ts add');
assert.equal(packageJson.scripts?.['release:changes:check'], 'bun scripts/release-changes.ts check');
assert.equal(packageJson.scripts?.['release:changes:test'], 'bun scripts/release-changes.ts self-test');
assert.equal(packageJson.scripts?.['release:prepare'], 'bun scripts/release-changes.ts prepare');
assert.ok(String(packageJson.scripts?.check).includes('bun run release:changes:test'));
assert.ok(String(packageJson.scripts?.check).includes('bun run release:changes:check'));

assert.match(workflow, /^name: Publish npm package$/m);
assert.match(workflow, /^\s+tags:$/m);
assert.ok(workflow.includes('- "v*"'));
assert.ok(workflow.includes('permissions:\n  contents: read'));
assert.equal(workflow.match(/id-token: write/g)?.length, 1);
assert.match(workflow, /publish:\n\s+needs: prepare[\s\S]*?permissions:\n\s+contents: read\n\s+id-token: write/);
assert.doesNotMatch(workflow, /prepare:[\s\S]*?id-token: write[\s\S]*?publish:/);
assert.ok(workflow.includes('group: npm-release-${{ github.repository }}-${{ github.ref }}'));
assert.ok(workflow.includes('cancel-in-progress: false'));
assert.ok(workflow.includes('timeout-minutes: 20'));
assert.equal(workflow.match(/timeout-minutes: 5/g)?.length, 2);
assert.ok(workflow.includes('uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7'));
assert.ok(workflow.includes('fetch-depth: 0'));
assert.ok(workflow.includes('persist-credentials: false'));
assert.ok(workflow.includes('name: Upload verified release inputs'));
assert.ok(workflow.includes('name: Download verified release inputs'));
assert.ok(workflow.includes('name: Verify release artifact'));
assert.ok(workflow.includes('name: Verify tagged commit is on main'));
assert.ok(workflow.includes('git merge-base --is-ancestor "$GITHUB_SHA" "origin/main"'));
assert.ok(workflow.includes('Release tag must point to a commit contained in origin/main.'));
assert.ok(workflow.includes('uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6'));
assert.ok(workflow.includes('registry-url: https://registry.npmjs.org'));
assert.ok(workflow.includes('uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2'));
assert.ok(workflow.includes('uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4'));
assert.ok(workflow.includes('uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4'));
assert.ok(actionReferences.length > 0, 'Release workflow must use at least one external action.');
assert.ok(
  actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)),
  'Every release workflow action must be pinned to a full commit SHA.'
);
assert.ok(workflow.includes('bun-version: 1.3.14'));
assert.ok(workflow.includes('name: Verify npm trusted publishing support'));
assert.ok(workflow.includes('npm 11.5.1 or later is required'));
assert.ok(workflow.includes('bun install --frozen-lockfile'));
assert.ok(workflow.includes('Release tag ${GITHUB_REF_NAME} does not match'));
assert.ok(workflow.includes('run: bun run check'));
assert.ok(workflow.includes('id: package_artifact'));
assert.ok(workflow.includes('bun scripts/build-release-artifact.ts --git-head "$GITHUB_SHA" --github-output "$GITHUB_OUTPUT"'));
assert.ok(workflow.includes('steps.package_artifact.outputs.tarball'));
assert.ok(workflow.includes('steps.package_artifact.outputs.manifest'));
assert.ok(workflow.includes('Release artifact integrity mismatch.'));
assert.ok(workflow.includes('needs: publish'));
assert.match(workflow, /release:\n\s+needs: publish[\s\S]*?permissions:\n\s+contents: write/);
assert.ok(workflow.includes('npm publish "${{ steps.artifact.outputs.tarball }}" --access public --provenance'));
assert.ok(!workflow.includes('NPM_TOKEN'));
assert.ok(!workflow.includes('NODE_AUTH_TOKEN'));
assert.ok(workflow.includes('dist.integrity'));
assert.ok(workflow.includes('Published npm metadata does not match the verified release artifact.'));
assert.ok(workflow.includes('npm view "${{ steps.artifact.outputs.package }}@${{ steps.artifact.outputs.version }}" dist.tarball'));
assert.ok(workflow.includes('CHANGELOG.md does not contain'));
assert.ok(workflow.includes('gh release create "$GITHUB_REF_NAME"'));
assert.ok(workflow.includes('gh release download "$GITHUB_REF_NAME"'));
assert.ok(workflow.includes('cmp "$RELEASE_TARBALL" "$release_assets/$RELEASE_TARBALL"'));
assert.ok(workflow.includes('cmp "$RELEASE_MANIFEST" "$release_assets/$RELEASE_MANIFEST"'));
assert.ok(workflow.includes('"$RELEASE_TARBALL#npm package tarball"'));
assert.ok(workflow.includes('"$RELEASE_MANIFEST#npm release artifact manifest"'));
assert.ok(!workflow.includes('gh release upload'));
assert.ok(!workflow.includes('--clobber'));

assert.match(releasePrWorkflow, /^name: Prepare release pull request$/m);
assert.match(releasePrWorkflow, /^\s+branches:\n\s+- main$/m);
assert.match(releasePrWorkflow, /^\s+paths:\n\s+- "\.changes\/\*\*"$/m);
assert.ok(releasePrWorkflow.includes('workflow_dispatch:'));
assert.ok(releasePrWorkflow.includes('permissions:\n  contents: read'));
assert.equal(releasePrWorkflow.match(/actions: write/g)?.length, 1);
assert.equal(releasePrWorkflow.match(/contents: write/g)?.length, 1);
assert.equal(releasePrWorkflow.match(/pull-requests: write/g)?.length, 1);
assert.ok(releasePrWorkflow.includes('group: release-pr-${{ github.repository }}'));
assert.ok(releasePrWorkflow.includes('cancel-in-progress: true'));
assert.ok(
  releasePrWorkflow.includes(
    "if: github.repository == '0disoft/zdp-design-system' && github.ref == 'refs/heads/main'"
  )
);

const releasePrPrepareStart = releasePrWorkflow.indexOf('\n  prepare:');
const releasePrApplyStart = releasePrWorkflow.indexOf('\n  apply:');
const releasePrValidateStart = releasePrWorkflow.indexOf('\n  validate:');
assert.ok(releasePrPrepareStart >= 0 && releasePrApplyStart > releasePrPrepareStart);
assert.ok(releasePrValidateStart > releasePrApplyStart);
const releasePrPrepareSection = releasePrWorkflow.slice(releasePrPrepareStart, releasePrApplyStart);
const releasePrApplySection = releasePrWorkflow.slice(releasePrApplyStart, releasePrValidateStart);
const releasePrValidateSection = releasePrWorkflow.slice(releasePrValidateStart);

assert.ok(releasePrPrepareSection.includes('timeout-minutes: 10'));
assert.ok(releasePrPrepareSection.includes('outputs:'));
assert.ok(releasePrPrepareSection.includes('has_changes: ${{ steps.prepare.outputs.has_changes }}'));
assert.ok(releasePrPrepareSection.includes('version: ${{ steps.prepare.outputs.version }}'));
assert.ok(releasePrPrepareSection.includes('bump: ${{ steps.prepare.outputs.bump }}'));
assert.ok(releasePrPrepareSection.includes('fragment_count: ${{ steps.prepare.outputs.fragment_count }}'));
assert.ok(!releasePrPrepareSection.includes('actions: write'));
assert.ok(!releasePrPrepareSection.includes('contents: write'));
assert.ok(!releasePrPrepareSection.includes('pull-requests: write'));
assert.ok(!releasePrPrepareSection.includes('GH_TOKEN'));

assert.ok(releasePrApplySection.includes('needs: prepare'));
assert.ok(releasePrApplySection.includes("if: needs.prepare.result == 'success'"));
assert.ok(releasePrApplySection.includes('timeout-minutes: 10'));
assert.match(releasePrApplySection, /permissions:\n\s+contents: write\n\s+pull-requests: write/);
assert.ok(!releasePrApplySection.includes('actions: write'));
assert.ok(!releasePrApplySection.includes('bun install'));
assert.ok(!releasePrApplySection.includes('bun run '));

assert.match(releasePrValidateSection, /needs:\n\s+- prepare\n\s+- apply/);
assert.ok(
  releasePrValidateSection.includes(
    "if: needs.prepare.outputs.has_changes == 'true' && needs.apply.result == 'success'"
  )
);
assert.ok(releasePrValidateSection.includes('timeout-minutes: 5'));
assert.match(releasePrValidateSection, /permissions:\n\s+actions: write\n\s+contents: read/);
assert.ok(!releasePrValidateSection.includes('contents: write'));
assert.ok(!releasePrValidateSection.includes('pull-requests: write'));
assert.ok(!releasePrValidateSection.includes('uses: actions/checkout@'));
assert.ok(!releasePrValidateSection.includes('uses: oven-sh/setup-bun@'));

assert.equal(
  releasePrWorkflow.match(/uses: actions\/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7/g)?.length,
  2
);
assert.equal(
  releasePrWorkflow.match(/uses: oven-sh\/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2/g)?.length,
  2
);
assert.ok(releasePrWorkflow.includes('fetch-depth: 0'));
assert.ok(releasePrWorkflow.includes('persist-credentials: false'));
assert.ok(releasePrWorkflow.includes('bun-version: 1.3.14'));
assert.ok(!releasePrWorkflow.includes('bun install'));
assert.equal(releasePrWorkflow.match(/bun scripts\/release-changes\.ts self-test/g)?.length, 2);
assert.equal(releasePrWorkflow.match(/bun scripts\/release-changes\.ts check/g)?.length, 2);
assert.equal(releasePrWorkflow.match(/bun scripts\/release-changes\.ts prepare/g)?.length, 2);
assert.ok(releasePrWorkflow.includes('--github-output "$GITHUB_OUTPUT"'));
assert.ok(releasePrWorkflow.includes('--release-notes "$RUNNER_TEMP/release-notes.md"'));
assert.ok(releasePrWorkflow.includes('uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4'));
assert.ok(releasePrWorkflow.includes('uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4'));
assert.ok(releasePrWorkflow.includes("schemaVersion: 'zdp.release-pr-artifact/v1'"));
assert.ok(releasePrWorkflow.includes('sourceSha: process.env.GITHUB_SHA'));
assert.ok(releasePrWorkflow.includes("createHash('sha256')"));
assert.ok(releasePrWorkflow.includes("expectedArchiveFiles = [...expectedFiles, 'manifest.json'].sort()"));
assert.ok(releasePrWorkflow.includes('Release PR artifact must contain regular files only.'));
assert.ok(releasePrWorkflow.includes('Release PR artifact contains an unexpected archive file set.'));
assert.ok(releasePrWorkflow.includes('Release PR artifact integrity mismatch for ${file}.'));
assert.ok(releasePrWorkflow.includes("!/^\\.changes\\/[a-z0-9]+(?:-[a-z0-9]+)*\\.md$/.test(file)"));
assert.ok(releasePrWorkflow.includes('Release PR artifact contains an invalid consumed fragment path.'));
assert.ok(releasePrWorkflow.includes('grep -Fx \'has_changes=true\''));
assert.ok(releasePrWorkflow.includes('grep -Fx "version=$EXPECTED_VERSION"'));
assert.ok(releasePrWorkflow.includes('cmp package.json "$artifact_dir/package.json"'));
assert.ok(releasePrWorkflow.includes('cmp CHANGELOG.md "$artifact_dir/CHANGELOG.md"'));
assert.ok(releasePrWorkflow.includes('cmp "$reproduced_notes" "$artifact_dir/release-notes.md"'));
assert.ok(releasePrWorkflow.includes('cmp "$reproduced_fragments" "$artifact_dir/consumed-fragments.txt"'));
assert.ok(releasePrWorkflow.includes('RELEASE_BRANCH: release/zdp-design-system'));
assert.ok(releasePrWorkflow.includes('git add package.json CHANGELOG.md .changes'));
assert.ok(releasePrWorkflow.includes('git push --force origin "HEAD:refs/heads/$RELEASE_BRANCH"'));
assert.ok(releasePrWorkflow.includes('gh pr create'));
assert.ok(releasePrWorkflow.includes('gh pr edit "$pr_number"'));
assert.ok(releasePrWorkflow.includes('gh workflow run design-system.yml'));
assert.ok(releasePrWorkflow.includes('"repos/$GITHUB_REPOSITORY/git/refs/heads/$RELEASE_BRANCH"'));
assert.ok(!releasePrWorkflow.includes('pull_request_target'));
assert.ok(!releasePrWorkflow.includes('id-token: write'));
assert.ok(!releasePrWorkflow.includes('npm publish'));
assert.ok(!releasePrWorkflow.includes('NPM_TOKEN'));
assert.ok(!releasePrWorkflow.includes('NODE_AUTH_TOKEN'));
assert.ok(releasePrActionReferences.length > 0, 'Release PR workflow must use at least one external action.');
assert.ok(
  releasePrActionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)),
  'Every release PR workflow action must be pinned to a full commit SHA.'
);

assert.ok(ciWorkflow.includes('workflow_dispatch:'));
assert.ok(ciWorkflow.includes('fixtures/*|.changes/*'));
assert.ok(ciWorkflow.includes('bun run surface:check'));
assert.ok(ciWorkflow.includes('bun run release:changes:test'));
assert.ok(ciWorkflow.includes('bun run release:changes:check'));
assert.ok(ciWorkflow.includes('permissions:\n  contents: read'));
assert.ok(ciWorkflow.includes('group: design-system-${{ github.workflow }}-${{ github.ref }}'));
assert.ok(ciWorkflow.includes('cancel-in-progress: true'));
assert.ok(ciWorkflow.includes('timeout-minutes: 20'));
assert.ok(ciWorkflow.includes('uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7'));
assert.ok(ciWorkflow.includes('persist-credentials: false'));
assert.ok(ciWorkflow.includes('uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2'));
assert.ok(ciActionReferences.length > 0, 'Main CI must use at least one external action.');
assert.ok(
  ciActionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)),
  'Every main CI action must be pinned to a full commit SHA.'
);
assert.ok(serviceContract.includes('required_secrets: []'));
assert.ok(
  changelog.includes(`## ${packageJson.version}`),
  `CHANGELOG.md must contain a ${packageJson.version} release section.`
);

console.log('Release workflow check passed.');
