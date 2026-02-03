## 2025-05-22 - [Accessible ID Generation]
**Learning:** Using `Math.random()` for form field IDs causes hydration issues and unstable IDs that can hinder accessibility tools. `React.useId()` provides stable, unique IDs perfect for connecting labels to inputs via `htmlFor`/`id`.
**Action:** Replace ad-hoc random ID generation with `React.useId()` in all reusable form components to ensure robust accessibility links.
