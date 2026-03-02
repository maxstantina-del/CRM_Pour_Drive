## 2025-05-18 - [Stable IDs for Accessibility]
**Learning:** `Math.random()` in render bodies causes IDs to change on every render, breaking screen reader associations and focus stability.
**Action:** Always use `React.useId()` for generating unique IDs in reusable components to ensure stability and proper hydration.
