## 2025-05-15 - Missing Form Associations
**Learning:** The custom form components (`Input`, `Select`) were rendering visual labels but missing programmatic association (`htmlFor`/`id`), breaking accessibility for screen readers and click-to-focus behavior.
**Action:** Use `React.useId()` in all future form components to automatically generate unique IDs and ensure robust label-to-input association without requiring manual ID prop passing.
