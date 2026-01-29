## 2025-05-27 - [Auto-generated IDs for Accessibility]
**Learning:** Common input components often lack `htmlFor`/`id` association when developers don't manually provide IDs, breaking screen reader support. React's `useId` hook provides a seamless fallback.
**Action:** Always implement `useId` fallback in base UI components (`Input`, `Select`, `Textarea`) to guarantee label association by default.
