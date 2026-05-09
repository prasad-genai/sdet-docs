# Page Object Model (POM) Design Strategy for Scalable Automation Frameworks

Page Object Model (POM) is one of the most commonly used design patterns in UI automation, but it is also one of the most commonly misused.

The problem is not the pattern itself—it is poor implementation.

A well-designed POM improves maintainability, readability, and long-term scalability. A poorly designed one creates bloated abstractions, unclear ownership, and difficult-to-maintain automation code.

The goal is not to use POM everywhere. The goal is to design it correctly when your framework needs it.

## Why POM Exists
As UI automation grows, tests often become tightly coupled to selectors and page implementation details.
Example:
```ts
await page.locator('#username').fill('admin');
await page.locator('#password').fill('Password123');
await page.locator('.login-btn').click();
```

This works initially, but creates problems over time:
- duplicated selectors across tests
- difficult maintenance when UI changes
- reduced test readability
- fragile automation structure

POM solves this by encapsulating UI behavior into reusable page abstractions.

Example:
```ts
await loginPage.login('admin', 'Password123');
```
This creates cleaner separation between test intent and UI implementation.


## Core Design Principles
### Single Responsibility

Each page object should represent one logical page or UI responsibility.

Good examples:
- LoginPage
- DashboardPage
- CheckoutPage

Avoid creating one large object for unrelated functionality.

Bad:
```
ApplicationPage.ts
```
This becomes difficult to maintain, debug, and scale.

### Encapsulation

Selectors should stay inside page objects.

Bad:
```ts
await page.locator('#username').fill('admin');
```

Better:
```ts
await loginPage.enterUsername('admin');
```
Tests should interact with page behavior, not selector implementation.


### Behavior-Oriented Methods
Page methods should represent meaningful user actions.

Good:
```ts
login()
searchProduct()
addItemToCart()
```

Avoid generic wrappers like:
```ts
clickElement()
fillInput()
performAction()
```
A good page API should reflect business intent, not low-level browser commands.


## Folder Structure

For small projects:
```
pages/
  LoginPage.ts
  DashboardPage.ts
  CheckoutPage.ts
```

For larger applications, organize by domain:
```
pages/
  auth/
    LoginPage.ts
    RegisterPage.ts

  commerce/
    ProductPage.ts
    CartPage.ts
    CheckoutPage.ts
```

Feature-based organization scales better than a flat folder structure.

## Locator Strategy

Locator quality directly affects test stability.

Prefer stable selectors:
- getByRole()
- getByLabel()
- getByTestId()

Avoid brittle selectors:
- nth-child
- deep CSS chains
- dynamic class selectors

Keep locators owned by the page object:
```ts
readonly usernameInput = this.page.getByLabel('Username');
readonly loginButton = this.page.getByRole('button', { name: 'Login' });
```
This keeps maintenance localized.


## Method Design

A practical POM usually contains two method types.

Action methods for individual interactions:
```ts
enterUsername()
clickLogin()
selectCountry()
```

Workflow methods for repeated business flows:
```ts
login()
completeCheckout()
createOrder()
```


Use workflow methods when the sequence is commonly reused.

Method naming should be explicit and readable.

Good:
- submitCredentials()
- openCheckoutPage()
- logout()


Avoid vague names like:
- execute()
- process()
- handleAction()


## Assertions and Boundaries

A common mistake is mixing assertions into every page object method.

Page objects should primarily model UI interactions.

Tests should contain business assertions.
Good:
```ts
await loginPage.login(user);
await expect(dashboardPage.welcomeMessage).toBeVisible();
```
This keeps responsibilities clean.


## Constructor Design

Inject dependencies explicitly.

Standard pattern:
```
constructor(private page: Page) {}
```
Avoid hidden dependencies inside page objects.

Bad practices:

- creating API clients inside pages
- loading environment config directly
- instantiating unrelated services internally

Page objects should stay focused on UI interaction.


## Reusable Components

Large applications often contain shared UI sections:

- header
- sidebar
- modal dialogs
- search widgets

These should be extracted into reusable components.

Example:
```
components/
  HeaderComponent.ts
  SidebarComponent.ts

```
Then compose them inside page objects rather than duplicating logic.


## Handling Dynamic UI State

Modern UIs are asynchronous.

Your page methods should handle interaction stability responsibly.

Examples:

- loading states
- delayed rendering
- modal visibility
- confirmation messages

Avoid fragile timing assumptions.

Bad:
```ts
await page.waitForTimeout(3000);
```
Prefer deterministic waiting using Playwright locators and built-in waiting behavior.



## Common POM Mistakes

Avoid these common anti-patterns:

### Fat page objects
Too many responsibilities in one class.

### Selector leakage
Tests directly accessing selectors.

### Generic utility abuse
Creating meaningless wrapper methods.

### Mixed concerns
Combining UI, API, config, and assertions in one class.

### Hardcoded test data
Embedding static users or environment values inside page objects.


## Recommended Minimal Structure

A scalable POM-based framework can remain simple:
```
framework/
  tests/
  pages/
  components/
  fixtures/
  utils/
```
Each folder should have a clear responsibility.


## Final Takeaway

POM is not about adding abstraction for the sake of architecture.

It is about creating clear boundaries between test intent and UI implementation.

A good Page Object Model makes automation easier to read, easier to maintain, and easier to scale.

A bad one becomes the problem it was meant to solve.