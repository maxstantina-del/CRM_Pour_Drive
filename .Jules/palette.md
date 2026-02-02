## 2025-05-15 - Missing ARIA labels on icon-only buttons
**Learning:** Developers often forget ARIA labels on icon-only buttons when using reusable Button components that don't enforce it, relying on icons to convey meaning which is invisible to screen readers.
**Action:** Always check icon-only buttons for `aria-label` or `title`. Consider enforcing this via prop types or lint rules in the Button component.
