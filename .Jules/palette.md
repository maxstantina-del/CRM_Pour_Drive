## 2025-05-24 - Automated Form Label Association
**Learning:** React 18's `useId` hook is critical for accessible form components. Manually managing IDs or hoping for implicit association often leads to unlabelled inputs for screen readers. By baking `useId` into the `Input` and `Select` primitives, we ensure 100% label association coverage without burdening the developer.
**Action:** Always use `useId` in reusable form components to generate default IDs for `htmlFor`/`id` pairs, while still allowing an `id` prop override.
