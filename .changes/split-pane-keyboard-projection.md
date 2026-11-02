---
bump: patch
---

- Separate split-pane keyboard size calculation from DOM events and controller mutations. Preserve direction, Shift steps, constrained endpoints, input guards, and resize callback order while calculating each keyboard request from one immutable layout snapshot.
