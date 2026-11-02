---
bump: patch
---

- Invalidate modal focus caches for every attribute change inside observed trees, including consumer CSS selectors using id, data-* or aria-expanded. Hidden controls leave the Tab order immediately and rejoin when shown, including inside open shadow roots.
