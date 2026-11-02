---
bump: patch
---

- Check the actual confirmation hold deadline before completing, including fractional durations. Isolate the clock and scheduler for deterministic tests and support cancellation without changing ConfirmAction props or slide/click behavior.
