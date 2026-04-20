# Page Object Model vs Modern Playwright Patterns  
## Part 1: Foundations, Limitations, and Correct Usage of POM

In modern QA automation, architectural decisions have a direct impact on:
- Maintainability
- Test reliability
- Scalability of the framework
- Team productivity

One of the most widely adopted patterns is the **Page Object Model (POM)**.  
However, with the rise of modern tools like playwright and strongly typed ecosystems like typescript, traditional interpretations of POM often lead to unnecessary complexity.

This part focuses on:
- Understanding POM in depth
- How it is implemented in real projects
- Where it provides value
- Where it fails in modern automation systems

---

## 1. What is the Page Object Model?

The Page Object Model is a design pattern where:
- Each page (or major UI section) is represented as a class
- Locators and interactions are encapsulated within that class
- Tests interact with methods instead of raw selectors

### Objective of POM

- Separate test logic from UI interaction logic
- Improve code reuse
- Reduce duplication
- Simplify maintenance when UI changes

---

## 2. Basic Implementation in Playwright (TypeScript)

### Example: Login Page Object

```ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private usernameInput = this.page.getByLabel('Username');
  private passwordInput = this.page.getByLabel('Password');
  private loginButton = this.page.getByRole('button', { name: 'Login' });

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### Test Usage
```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('user', 'password');

  await expect(page).toHaveURL('/dashboard');
});
```


## 3. Industry Perspective: Why POM Became Standard

POM became popular due to limitations in older tools like Selenium:

- No auto-waiting
- Weak locator strategies
- High code duplication
- Difficult maintenance

POM addressed these problems by:

- Centralizing selectors
- Encapsulating actions
- Encouraging structured frameworks

In traditional automation stacks, POM was almost mandatory.

## 4. Applying POM Correctly (Best Practices)

When used correctly, POM still provides strong benefits.

### 4.1 Keep Page Objects Focused

Each page object should:

Represent a single page or logical section
Avoid handling unrelated flows

Good Example
```ts
class LoginPage {
  async login() {}
}
```

Avoid
```ts
class AppPage {
  async login() {}
  async logout() {}
  async createOrder() {}
  async deleteUser() {}
}
```

### 4.2 Use Locators, Not Raw Selectors

Leverage Playwright locators inside POM:
```ts
private submitButton = this.page.getByRole('button', { name: 'Submit' });
```

Avoid:
```ts
await this.page.click('#submit-btn');
```

This ensures:

- Stability
- Auto-waiting support
- Better readability


### 4.3 Expose Business Actions, Not UI Steps

A page object should expose intent, not implementation details.

Bad
```ts
async enterUsername(username: string) {}
async enterPassword(password: string) {}
async clickLogin() {}
```

Good
```ts
async login(username: string, password: string) {}
```

This keeps tests:

- Clean
- Intent-driven
- Easy to understand


### 4.4 Avoid Assertions Inside Page Objects

Page objects should handle actions, not validations.

Incorrect
```ts
async login() {
  await this.loginButton.click();
  await expect(this.page).toHaveURL('/dashboard');
}
```

Correct
```ts
async login() {
  await this.loginButton.click();
}
```
Assertions belong in test files.


### 4.5 Keep Page Objects Stateless

Avoid storing dynamic test data inside page objects.

Incorrect
```ts
class LoginPage {
  private username: string;

  setUsername(username: string) {
    this.username = username;
  }
}
```
Page objects should act as:

- Interaction layers
- Not data containers


## 5. Where POM Starts Breaking Down

Despite its benefits, POM often becomes problematic in modern Playwright projects.

### 5.1 Over-Abstraction

Excessive method splitting reduces clarity:
```ts
await loginPage.enterUsername(user);
await loginPage.enterPassword(pass);
await loginPage.clickLogin();
```

Compared to:
```ts
await loginPage.login(user, pass);
```

Over-abstraction leads to:

- Verbose tests
- Reduced readability
- More maintenance overhead


### 5.2 Large, Unmanageable Page Classes

Over time, page objects grow:
```ts
class DashboardPage {
  async createUser() {}
  async deleteUser() {}
  async filterReports() {}
  async exportData() {}
}
```

Problems:

- Violates single responsibility principle
- Hard to maintain
- Hard to navigate


### 5.3 Reduced Test Transparency

Tests should clearly describe behavior.

With heavy POM:
```ts
await dashboardPage.performUserOperation();
```
The actual steps are hidden, requiring:

- Navigation to multiple files
- Additional cognitive effort


### 5.4 Misalignment with Playwright Design

Playwright already provides:

- Auto-waiting
- Powerful locators
- Built-in fixtures

Heavy POM layers often:

- Duplicate functionality
- Add unnecessary abstraction
- Reduce Playwright’s natural advantages


### 6. Real-World Scenario: Misused POM
Example of Over-Engineered Design
```ts
class LoginPage {
  async enterUsername(username: string) {}
  async enterPassword(password: string) {}
  async clickLoginButton() {}
}

class DashboardPage {
  async verifyLoginSuccess() {}
}
```

Test
```ts
await loginPage.enterUsername(user);
await loginPage.enterPassword(pass);
await loginPage.clickLoginButton();
await dashboardPage.verifyLoginSuccess();
```

Issues:

- Too many small methods
- Scattered logic
- Hard to follow flow


## 7. When You Should Use POM

POM is still valuable in specific scenarios:

### 7.1 Complex, Reusable Workflows

Examples:

- Authentication flows
- Checkout processes
- Multi-step forms


### 7.2 Stable UI Components

If UI:

- Does not change frequently
- Has clear boundaries

POM can provide long-term value

### 7.3 Large Teams with Shared Codebase

POM helps:

- Standardize structure
- Improve collaboration
- Reduce duplication


## 8. When You Should Avoid Heavy POM

Avoid strict POM when:

- Tests are simple and linear
- UI is rapidly evolving
- Abstraction reduces clarity
- Debugging becomes harder
- Page classes become too large


## 9. Key Observations from Modern Projects

In real-world Playwright projects:

- Heavy POM frameworks often slow teams down
- Simpler patterns lead to faster development
- Maintainability depends more on clarity than structure
- Over-abstraction is a bigger problem than duplication


## 10. Summary of Part 1
- POM is a useful but often overused pattern
- It solves real problems—but only when applied correctly
- Misuse leads to:
    - Over-abstraction
    - Reduced readability
    - Maintenance challenges
- Playwright reduces the need for heavy POM due to its built-in capabilities
