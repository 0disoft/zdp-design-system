---
bump: patch
---

- Keep the package build lock until outstanding directory operations and rollback finish, reject overlapping operations on one transaction, and attempt lock removal even if handle closure fails.
