## 2024-05-24 - Stable ID Generation for Form Components
**Learning:** `Math.random()` caused unstable IDs in form components (`Input`, `Select`), leading to potential hydration mismatches and inconsistent accessibility associations.
**Action:** Use `React.useId()` for all future form components to ensure stable, unique IDs that work correctly with server-side rendering and client-side hydration.
