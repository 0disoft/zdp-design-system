# Repository navigation

LLMNav currently indexes only `scripts/`. Reviewed module cards cover token-name generation, package assembly, interrupted replacement recovery, component/shared-CSS parity, and navigation request dispatch. Components, stories, tokens and production helpers are not covered; use the existing context map and text search for them.

This workspace uses its existing LLMNav checkout. No npm dependency, installation or release is introduced. A standalone clone does not have a bundled navigation runner. Command authority remains `.mustflow/config/commands/zdp-design-system.toml` in the workspace.

## Free-form requests

Create a task-specific JSON file directly under the ignored `.llmnav/state/requests/` directory. Use an alphanumeric, underscore or hyphen filename with a `.json` extension. New Korean/English tasks and semantic IDs do not require command-contract changes.

```json
{"action":"query","task":"공유 CSS에서 조건부 hover 스타일이 빠지는지 확인하는 코드는 어디야?"}
```

Run `mf run zdp_design_system_llmnav_request --repo projects/zdp-platforms/client-surfaces/zdp-design-system --input request=.llmnav/state/requests/my-task.json`. Replace the request with `{"action":"show","id":"zdp.design.styles.parity"}` or `{"action":"context","id":"zdp.design.styles.parity"}` to resolve a result. Use distinct filenames for concurrent tasks. If no credible candidate appears, switch to ordinary search immediately.

Requests allow only `action` and `task` or `id`. The root and LLMNav module are code-owned, never request-owned. Query text goes directly to the API, not a shell or process argument parser. Queries return at most five results; context uses depth 1, budget 2500 and at most 24 edges. Inputs are capped at 8192 bytes and 2000 task characters; output is bounded. Nothing writes source or starts a background process.

Request files must be ordinary single-link files under ordinary directories. The reader rejects static symlinks/junctions and reads through one checked handle. This is a trusted local-checkout workflow, not a sandbox for hostile processes concurrently replacing parent directories. Node path APIs do not provide a cross-platform kernel-level containment guarantee. Do not put secrets or customer data in requests.

## Maintenance

- `zdp_design_system_llmnav_request_check`: request validation and fixed dispatch regression checks.
- `zdp_design_system_llmnav_audit`: review candidates; findings do not authorize automatic annotation.
- `zdp_design_system_llmnav_format`, then `zdp_design_system_llmnav_generate`, then `zdp_design_system_llmnav_verify`: canonicalize, regenerate and validate cards, deterministic indexes and retrieval cases.

Use these through `mf run <intent> --repo projects/zdp-platforms/client-surfaces/zdp-design-system`. Preserve existing Mustflow anchors. Cards describe durable meaning, never paths, line numbers, permissions or validation authority. Generated locations and signatures belong only in the cache.

## Evidence and scope

The English/Korean queries are development-set checks, not independent performance observations. Initialization and annotation are not real-task trials. For the next independently arising task, record the original query, fallback searches, files actually opened, and acceptance evidence; leave unavailable timing and token measurements unknown. No background collection is installed.

These changes are development-only and outside the npm files allowlist; the package version remains unchanged.

The scoped audit reports the release-artifact builder as a medium candidate. Its publication responsibility is real, but release tooling is outside this pilot; it is not suppressed as a false positive. Other unannotated scripts remain discoverable through ordinary search.

During setup, a module card appended to the CSS parity checker was not recognized. Moving the card before imports made validation succeed. Keep cards at the file header; the underlying parser cause has not been diagnosed here.
