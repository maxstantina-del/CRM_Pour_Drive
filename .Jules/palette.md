## 2024-05-23 - [Auto-ID for Accessibility]
**Learning:** React 18's `useId` hook is perfect for automatically linking labels and inputs without manual ID management, reducing friction for developers while guaranteeing accessibility.
**Action:** Use `useId` in all form primitives (`Input`, `Select`, `Checkbox`, etc.) to generate unique IDs for `htmlFor`, `aria-describedby`, and `aria-errormessage`.
