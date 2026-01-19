## 2024-05-23 - [Form Accessibility: Missing Label Associations]
**Learning:** The custom `Input` and `Select` components rendered labels visually but failed to programmatically associate them with their respective inputs using `htmlFor` and `id`. This makes the forms inaccessible to screen readers and reduces usability for all users (clicking label doesn't focus input).
**Action:** Use `React.useId()` in all form primitives to automatically generate unique IDs and ensure 1:1 label-to-input association without requiring manual ID prop drilling.
