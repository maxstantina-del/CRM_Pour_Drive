## 2026-01-30 - [Stable Form IDs]
**Learning:** Generating random IDs for form inputs (`Math.random()`) causes hydration mismatches and breaks accessibility references if the component re-renders.
**Action:** Always use `React.useId()` for generating unique, stable IDs for form controls.
