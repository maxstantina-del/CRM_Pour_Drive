## 2025-02-18 - [Async Form Feedback]
**Learning:** Forms in this architecture (`App.tsx` handling logic, `LeadForm.tsx` handling UI) often miss loading states because the async context is lost at the boundary.
**Action:** Always check if `onSubmit` handlers are async and ensure `isLoading` props are passed down to presentation components to prevent double-submissions and provide feedback.
