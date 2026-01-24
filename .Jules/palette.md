## 2025-12-15 - Verifying Accessibility with Playwright
**Learning:** When verifying accessibility improvements like `htmlFor` association, visual screenshots are insufficient. Use Playwright's `evaluate` to check `document.activeElement` after clicking a label to confirm the input receives focus.
**Action:** Always include interaction verification (click label -> check focus) when improving form accessibility.
