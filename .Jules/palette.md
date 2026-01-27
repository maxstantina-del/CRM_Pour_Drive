## 2025-05-25 - [Accessibility] Missing Label-Input Association
**Learning:** The reusable `Input` and `Select` components in this project did not automatically associate labels with their form controls using `for`/`id`, relying solely on manual props or visual adjacency, which breaks accessibility for screen readers and click-to-focus.
**Action:** Updated `Input` and `Select` to use `React.useId()` to generate a unique ID if one isn't provided, ensuring robust label association without breaking the API.
