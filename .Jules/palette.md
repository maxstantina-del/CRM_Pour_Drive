## 2025-10-27 - Automating Form Accessibility
**Learning:** React 18's `useId` hook provides a robust way to generate unique IDs for form inputs, ensuring `htmlFor`/`id` association works reliably even when the developer doesn't manually provide IDs. This is critical for screen readers to announce labels correctly.
**Action:** Always wrap form components with automatic ID generation using `useId` so that basic accessibility is "free" for the consumer of the component.
