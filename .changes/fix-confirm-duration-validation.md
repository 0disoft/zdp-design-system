---
bump: patch
---

- Keep confirmation holds from firing immediately for non-finite or overflowing durations; use the default for non-finite values and cap timer delays safely.
