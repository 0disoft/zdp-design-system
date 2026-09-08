# Development navigation pilot

LLMNav currently indexes only `scripts/`. Four reviewed module cards cover token-name generation, package assembly, interrupted replacement recovery, and component/shared-CSS parity. Components, stories, tokens and production helpers are not covered; use the existing context map and text search for them.

This workspace uses its existing LLMNav checkout; no npm dependency, install, release, or package runtime change is introduced. A standalone clone does not yet have a bundled navigation runner. Command authority remains the workspace fragment `.mustflow/config/commands/zdp-design-system.toml`.

- `zdp_design_system_llmnav_query`: select a pilot symptom through the `task` input.
- `zdp_design_system_llmnav_show`: resolve one of the four semantic IDs through the `id` input.
- `zdp_design_system_llmnav_audit`: review candidates; findings are not automatic annotation requests.
- `zdp_design_system_llmnav_format`, then `zdp_design_system_llmnav_generate`, then `zdp_design_system_llmnav_verify`: canonicalize, regenerate and validate source cards, deterministic indexes and retrieval cases.

Use these through `mf run <intent> --repo projects/zdp-platforms/client-surfaces/zdp-design-system`. Query inputs are initially bounded to the configured Korean pilot phrases; extend the reviewed contract for new tasks rather than silently running an unconfigured command. If no credible candidate appears, switch to ordinary search immediately.

Preserve existing Mustflow anchors. LLMNav comments describe durable meaning, never paths, line numbers, permissions or validation authority. Generated locations and signatures belong only in the generated cache.

The eight English/Korean queries are development-set checks, not independent performance observations. The initialization and annotation work is not a real-task trial. For the next independently arising task, record the original query, fallback searches, files actually opened, and acceptance evidence; leave unavailable timing and token measurements unknown. No background collection is installed.

All changes are development-only and outside the npm files allowlist; the package version remains unchanged.

## Known pilot limits

The scoped audit still reports the release-artifact builder as a medium candidate. Its immutable publication artifact responsibility is real, but release tooling is deliberately outside the four-boundary pilot; it is not suppressed as a false positive. Other unannotated scripts remain discoverable through ordinary search.

During setup, a module card appended to the CSS parity checker was not recognized. Moving the card before the imports made validation succeed. Keep pilot cards at the file header; the underlying parser cause has not been diagnosed here.
