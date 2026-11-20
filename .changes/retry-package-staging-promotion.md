---
bump: patch
---

- Retry transient EPERM errors when promoting a completed package build, preserving the previous output if promotion still fails.
