# Eliminating Flaky Tests in Playwright

Flaky tests are one of the most damaging issues in UI automation.  
They introduce uncertainty into test results, slow down delivery pipelines, and gradually erode team confidence in automation.

A reliable test suite should behave deterministically—given the same code and environment, it should produce the same result every time.  
When that guarantee breaks, debugging becomes expensive and trust in the system declines.

This document provides a practical, engineering-focused guide to:
- Understanding the root causes of flaky tests
- Identifying anti-patterns that lead to instability
- Applying robust solutions using Playwright with TypeScript

---

## What is a Flaky Test?

A flaky test is one that produces inconsistent outcomes without any change in the application or test code.

Typical pattern:

Run 1 → Pass \
Run 2 → Fail \
Run 3 → Pass

Such behavior indicates that the test is not properly synchronized with the application state.

---

## Understanding the Root Causes

Flakiness is not random—it is the result of incorrect assumptions about how the application behaves under real conditions.

---

### 1. Asynchronous UI and Timing Issues

Modern applications rely heavily on asynchronous operations:
- API calls
- Dynamic rendering
- Client-side state updates
- Animations and transitions

If a test interacts with elements before they are ready, failures occur intermittently.

---

### 2. Incorrect Waiting Strategies

A common mistake is relying on fixed delays:

```ts
await page.waitForTimeout(3000);
```

This approach is unreliable because:
- It assumes consistent timing across environments
- It slows down execution unnecessarily
- It still fails under variable conditions


### 3. Unstable Selectors

Selectors tied to DOM structure are fragile:
```ts
await page.click('.btn-primary:nth-child(3)');
```

These break when:
- UI layout changes
- Classes are refactored
- Elements are reordered


### 4. Network Variability and Race Conditions
Tests often assume predictable execution order, but:

- Network latency varies
- Multiple async operations may overlap
- UI updates may not occur immediately after actions


### 5. Shared or Uncontrolled State

Tests become unreliable when they:

- Depend on other tests
- Use shared accounts
- Rely on inconsistent database state

Symptoms vs Root Causes

Many teams attempt to fix flakiness by addressing symptoms instead of underlying issues.

| Symptom	| Ineffective Fix |	Correct Approach |
| ----- | ----- | ---- |
| Element not found |	Add delay |	Wait for element state |
| Click fails |	Retry action |	Ensure element is actionable |
| Assertion fails randomly |	Increase timeout |	Use retrying assertions |


## Reliable Solution Strategy
The following practices form a stable foundation for Playwright-based automation.

### 1. Rely on Playwright Auto-Waiting

Playwright automatically waits for elements to be:

- Visible
- Stable
- Enabled
- Ready for interaction

Avoid manual waits unless absolutely necessary.

Incorrect:
```ts
await page.waitForTimeout(2000);
await page.click('#login');
```

Correct:
```ts
await page.getByRole('button', { name: 'Login' }).click();
```


### 2. Replace Fixed Delays with Explicit Conditions

Synchronization should be based on application state—not time.

Wait for elements
```ts
await page.locator('#dashboard').waitFor();
```

Wait for navigation
```ts
await expect(page).toHaveURL(/dashboard/);
```

Wait for API responses
```ts
await page.waitForResponse(response =>
  response.url().includes('/api/user') && response.status() === 200
);
```


### 3. Use Stable and Meaningful Locators

Selectors should be resilient and readable.

Recommended approaches:
```ts
await page.getByRole('button', { name: 'Submit' });
await page.getByTestId('login-button');
await page.getByText('Welcome');
```

Collaborate with developers

Introduce test-specific attributes:
```html
<button data-testid="login-button">Login</button>
```

```ts
await page.getByTestId('login-button').click();
```

### 4. Use Assertions with Built-in Retries

Avoid instant assertions on retrieved values.

Incorrect:
```ts
const text = await page.textContent('#status');
expect(text).toBe('Success');
```

Correct:
```ts
await expect(page.locator('#status')).toHaveText('Success');
```
Playwright assertions automatically retry until the expected condition is met.



### 5. Synchronize with Network Activity

UI actions often depend on backend responses.
```ts
const responsePromise = page.waitForResponse('/api/order');

await page.getByRole('button', { name: 'Place Order' }).click();

await responsePromise;
```
This ensures the test progresses only after the relevant API call completes.


### 6. Maintain Complete Test Isolation

Each test should:

- Be independent
- Be runnable in isolation
- Not depend on execution order

Avoid:
```ts
test('Step 2', async ({ page }) => {
  // depends on previous test
});
```
Prefer:
```ts
test('User can place order', async ({ page }) => {
  await login(page);
  await placeOrder(page);
});
```


### 7. Optimize Authentication Handling

Avoid repeating login steps in every test.

Use Playwright’s storage state:
```ts
test.use({ storageState: 'auth.json' });
```
Generate once:
```ts
await page.context().storageState({ path: 'auth.json' });
```
This reduces both execution time and potential points of failure.


### 8. Manage Test Data Explicitly

Uncontrolled test data introduces unpredictability.

Best practices:

- Use dynamically generated data
- Prefer API-based setup over UI setup
- Avoid shared test accounts
```ts
const user = await createTestUser();
await loginWithUser(page, user);
```


### 9. Use Retries Judiciously

Retries can help with temporary instability:
```ts
retries: 2
```
However:

- They should not be used to hide real issues
- Persistent failures must be investigated and fixed


### 10. Use Playwright Debugging Tools

Effective debugging is essential for resolving flakiness.

Trace Viewer
```
npx playwright show-trace trace.zip
```

Headed mode
```
npx playwright test --headed
```

Slow motion execution
```ts
use: {
  launchOptions: {
    slowMo: 100
  }
}
```
These tools provide visibility into execution flow and timing issues.



## Example: From Flaky to Stable
Flaky Implementation
```ts
test('login test', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#username', 'user');
  await page.fill('#password', 'pass');

  await page.waitForTimeout(3000);
  await page.click('.btn-primary');

  const text = await page.textContent('#message');
  expect(text).toBe('Welcome');
});
```

Stable Implementation
```ts
test('login test', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Username').fill('user');
  await page.getByLabel('Password').fill('pass');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('#message')).toHaveText('Welcome');
});
```


## Key Takeaways
- Avoid hard waits and rely on condition-based synchronization
- Use Playwright’s built-in auto-waiting and retry mechanisms
- Prefer stable, semantic locators
- Ensure tests are isolated and deterministic
- Control test data and environment state
- Use debugging tools to identify real issues


## Conclusion

Flaky tests are not an unavoidable side effect of automation—they are a signal of gaps in synchronization, design, or test strategy.

By addressing root causes and applying disciplined practices, you can build a test suite that is:

- Predictable
- Maintainable
- Trusted by the entire team

Reliability is the foundation of effective automation. Without it, even extensive test coverage fails to deliver value.