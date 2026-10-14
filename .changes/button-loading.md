---
bump: minor
---

- Add Button loading state with readable labels and native disabled behavior to block repeated actions. Omitting loading or passing `false` keeps the normal button width with no reserved spinner slot. The spinner takes space only while `loading={true}`, without changing the label or height. Support static Astro CSS and reduced motion.
