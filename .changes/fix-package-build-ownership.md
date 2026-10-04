---
bump: patch
---

- Hold an exclusive package build lock across recovery, staging, promotion, and cleanup so overlapping builds cannot remove each other's output.
