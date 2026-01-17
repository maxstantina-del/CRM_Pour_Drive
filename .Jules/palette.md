# Palette's Journal

## 2025-02-14 - Accessibility in Form Components
**Learning:** Common form components (Input, Select) often miss the programmatic link between labels and inputs, which degrades the screen reader experience.
**Action:** Use `React.useId()` to automatically generate unique IDs and link labels to inputs via `htmlFor` and `id` attributes in reusable components. Also ensure error messages are programmatically associated using `aria-describedby`.
