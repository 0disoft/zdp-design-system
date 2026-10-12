---
bump: minor
---

- Unify Input, Textarea, Select, Combobox, and CommandField around shared field surface, border, typography, radius, height, and padding tokens. Keep invalid, readonly, disabled, and focus states distinct.
- Use one packaged SVG indicator for Select and Combobox in both native-select browser paths and framework-neutral CSS, with the same size and logical edge inset.
- Verify rendered control geometry in nested light/dark themes and LTR/RTL alongside native input and Combobox interaction regressions.
