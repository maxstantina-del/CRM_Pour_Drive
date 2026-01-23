## 2026-01-23 - [React ID Verification]
**Learning:** `React.useId()` generates IDs with colons (e.g., `:r1:`), which break standard CSS selectors (like `#id`). Playwright and other tools fail to query these unless escaped or queried differently.
**Action:** Use attribute selectors `[id='...']` instead of `#...` when verifying components that use `useId`.
