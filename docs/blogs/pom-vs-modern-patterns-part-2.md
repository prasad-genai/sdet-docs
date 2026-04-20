# Page Object Model vs Modern Playwright Patterns  
## Part 2: Modern Alternatives, Scalable Architecture, and Practical Implementation

In Part 1, we analyzed the Page Object Model (POM):
- Where it works
- Where it fails
- Why it often becomes over-engineered in modern automation

In this part, we move from theory to **practical architecture decisions** using playwright with typescript.

The goal is not to reject POM—but to build a **balanced, scalable, and maintainable test architecture**.

---

## 1. The Shift in Modern Automation Design

Modern tools like Playwright provide:
- Built-in auto-waiting
- Powerful locator strategies
- First-class fixtures
- Parallel execution support

Because of this, the need for heavy abstraction layers has significantly reduced.

### Key Principle

> Prefer **clarity and simplicity** over rigid design patterns.

---

## 2. Modern Patterns That Replace Heavy POM

Instead of relying entirely on page objects, modern Playwright projects use a combination of:

- Test-first design
- Helper functions
- Component-based abstractions
- Fixtures for setup and state management

---

## 3. Pattern 1: Test-First (Inline Clarity)

Keep logic directly in tests when abstraction is unnecessary.

```ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Username').fill('user');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/dashboard');
});
```

### Why this works
- Clear and readable
- No indirection
- Easy to debug
- No unnecessary files


### When to use
- Simple flows
- One-time interactions
- Early-stage projects


## 4. Pattern 2: Helper Functions (Lightweight Abstraction)

Encapsulate reusable flows without creating full classes.
```ts
// utils/auth.ts
import { Page } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}
```

### Usage
```ts
test('user can login', async ({ page }) => {
  await login(page, 'user', 'password');
});
```

### Benefits
- Minimal abstraction
- Reusable across tests
- Keeps test intent clear



## 5. Pattern 3: Component-Based Design

Instead of modeling entire pages, model reusable UI components.
```ts
// components/navbar.ts
import { Page } from '@playwright/test';

export class Navbar {
  constructor(private page: Page) {}

  async logout() {
    await this.page.getByRole('button', { name: 'Logout' }).click();
  }
}
```

### Usage
```ts
const navbar = new Navbar(page);
await navbar.logout();
```

### Advantages
- Smaller, focused classes
- Reusable across multiple pages
- Avoids large monolithic page objects



## 6. Pattern 4: Playwright Fixtures (Recommended Core Pattern)

Fixtures are one of the most powerful features in Playwright and should be central to your architecture.

### Example: Custom Fixture
```ts
// fixtures/base.ts
import { test as base } from '@playwright/test';
import { login } from '../utils/auth';

export const test = base.extend<{
  loggedInPage: any;
}>({
  loggedInPage: async ({ page }, use) => {
    await login(page, 'user', 'password');
    await use(page);
  },
});
```

### Usage
```ts
import { test, expect } from '../fixtures/base';

test('dashboard is accessible', async ({ loggedInPage }) => {
  await expect(loggedInPage).toHaveURL('/dashboard');
});
```

### Why fixtures are critical
- Centralized setup logic
- Clean test files
- Reusable test state
- Works seamlessly with parallel execution



## 7. Hybrid Architecture (Industry Recommended Approach)

The most effective approach is not choosing one pattern—but combining them.

### Recommended Strategy
| Concern	| Pattern |
| -----  |   ---- | 
| Simple flows |	Inline test logic |
| Reusable actions |	Helper functions |
| Shared UI parts |	Component classes |
| Setup / state	 | Fixtures |
| Complex workflows | 	Limited POM |



### 8. Suggested Project Structure

A clean, scalable structure for Playwright projects:
```
tests/
  auth/
    login.spec.ts
  dashboard/
    dashboard.spec.ts

utils/
  auth.ts
  data.ts

components/
  navbar.ts
  modal.ts

fixtures/
  base.ts

playwright.config.ts
```


### Design Principles
- Keep structure flat and understandable
- Avoid deep nesting
- Group by feature, not by pattern


## 9. Real-World Comparison

### ❌ Over-Engineered POM

```
await loginPage.enterUsername(user);
await loginPage.enterPassword(pass);
await loginPage.clickLoginButton();
await dashboardPage.verifyLoginSuccess();
```

### Problems:

- Too many steps
- Hard to follow
- Requires jumping across files


### Modern Approach
```ts
await login(page, user, pass);
await expect(page).toHaveURL('/dashboard');
```

Benefits:

- Clear intent
- Fewer abstractions
- Easier debugging


## 10. Decision Framework

Before introducing a new abstraction, ask:

### 1. Is this logic reused?

If no → keep it inline

### 2. Does abstraction improve readability?

If no → avoid abstraction

### 3. Can this be a helper instead of a class?

Prefer functions over classes where possible

### 4. Will this scale as the project grows?

Avoid creating structures that will become bottlenecks


## 11. Common Anti-Patterns to Avoid

### 11.1 Creating Page Objects for Every Page

Not every page needs a class.

### 11.2 Splitting Actions Too Much
```ts
enterUsername()
enterPassword()
clickLogin()
```

Prefer meaningful actions instead.

### 11.3 Hiding Too Much Logic

Tests should remain readable without opening multiple files.

### 11.4 Ignoring Playwright Features

Avoid re-implementing:

- Waiting logic
- Setup handling
- State management

Playwright already provides these.



## 12. Best Practices Summary
- Start simple—add abstraction only when needed
- Prefer helper functions over heavy classes
- Use fixtures for setup and shared state
- Keep components small and reusable
- Avoid large, monolithic page objects
- Keep tests readable and intention-driven
- Leverage Playwright features instead of duplicating them



## 13. Final Conclusion

The Page Object Model is not obsolete—but it is no longer the default solution for every problem.

Modern Playwright-based automation favors:

- Simplicity over rigid structure
- Clarity over abstraction
- Composition over inheritance

A well-designed framework is not defined by patterns—it is defined by how easily:

- Engineers can write tests
- Failures can be debugged
- The system can evolve over time

The most effective teams do not strictly follow POM.
They adapt their architecture based on real needs—using the right tool for the right problem.
