# Context Map

| Work type | Read first | Validate with |
| --- | --- | --- |
| Token or CSS change | `tokens/zdp.tokens.json`, `src/styles/tokens.css`, token generator/checker scripts | `zdp_design_system_package_verify` |
| Component API change | `src/lib/**`, `stories/**`, `fixtures/**`, `docs/CONSUMER_CONTRACT.md` | `zdp_design_system_package_verify`, `zdp_design_system_npm_pack_dry_run` when package surface changes |
| Storybook or preview change | `.storybook/**`, `stories/**`, `preview/**`, checker scripts | `zdp_design_system_package_verify`, `zdp_design_system_bundle_analyze` when static build evidence changes |
| External UI adoption | `docs/EXTERNAL_UI_ADOPTION.md`, `docs/INTERACTIVE_PRIMITIVE_AUDIT.md`, `THIRD_PARTY_NOTICES.md` | `zdp_design_system_package_verify` |
| Service contract | `service.yaml`, `README.md`, package docs | `zdp_architecture_validate_design_system_repository` |
| Agent docs only | `AGENTS.md`, `CHECKLIST.md`, `VALIDATION.md`, `.agents/**` | `docs_validate_fast` |
