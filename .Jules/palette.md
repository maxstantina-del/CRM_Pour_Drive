## 2024-05-23 - Accessibility of Form Inputs
**Learning:** React 18's `useId` hook is essential for accessible form inputs when reusable components don't enforce an ID prop. Without it, associating labels with inputs programmatically is error-prone or impossible in dynamic lists.
**Action:** Always implement `useId` in low-level form components (`Input`, `Select`, `Textarea`) to provide a fallback unique ID for `htmlFor` association.
