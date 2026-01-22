## 2024-05-22 - [Automated Form Accessibility]
**Learning:** Form inputs often lack proper label association when developers forget to manage IDs manually.
**Action:** Use `React.useId()` inside generic UI components (`Input`, `Select`) to automatically generate and link unique IDs for labels and inputs, ensuring default accessibility without extra effort from the developer.
