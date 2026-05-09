# Handling Test Data and State in Playwright

Many flaky automation issues are blamed on Playwright, but in most cases, the real problem is poor test data management.

Random failures, broken parallel execution, locked shared users, and tests that depend on execution order usually indicate uncontrolled test state—not a tooling issue.

A scalable automation framework treats test data as part of the architecture.

## Common Problem Areas

Many teams start with shortcuts like hardcoded users or UI-based setup:
```ts
await login('testuser1', 'password');
```

This may work initially, but it becomes unstable over time when:
- credentials change
- hared accounts get locked
- multiple tests modify the same data
- parallel execution causes collisions

These patterns create fragile automation.

## Hardcoded vs Dynamic Test Data

Hardcoded data is acceptable for simple read-only validations or smoke checks:
```ts
const user = {
  email: 'qa@test.com',
  password: 'Password123'
};
```

But for most functional automation, dynamic test data is the safer approach:
```ts
const user = {
  email: `user-${crypto.randomUUID()}@test.com`,
  password: 'Password123'
};
```

Dynamic data makes tests:
- independent
- parallel-safe
- reusable
- scalable

A better practice is to centralize test data creation using a factory pattern:
```ts
export const userFactory = () => ({
  email: `user-${crypto.randomUUID()}@test.com`,
  password: 'Password123'
});
```
Avoid generating random data directly inside test files.

## API Setup vs UI Setup
A common mistake is preparing test state through the UI:
```ts
await createUserThroughUI();
await loginThroughUI();
await createCartThroughUI();
```

This increases execution time and introduces unnecessary flakiness.

A better approach is API-based setup:
```ts
await apiClient.createUser();
await apiClient.createCart();
```

This is faster, more reliable, and easier to maintain.

Rule: Use UI to test UI. Use APIs to prepare test data.

## API vs Database Seeding

API setup should be the default choice because it follows real application behavior and is easier to maintain.

Database seeding can be useful when APIs are unavailable or complex state setup is required, but it comes with trade-offs:
- schema dependency
- maintenance overhead
- bypassing business logic
- environment access limitations

Practical preference:
```
API setup > DB seeding > UI setup
```


## Test Independence
Every test should be self-contained.
Avoid workflows where one test creates data and another depends on it.

Bad example:
```
Test A creates user
Test B updates user
Test C deletes user
```

This creates execution dependency and parallel failures.
Each test should own its own data.


## Cleanup Strategy
Two common approaches work well.

Disposable data is usually the simplest—create unique data and allow scheduled cleanup processes to remove it later.

If cleanup is required immediately, use explicit teardown:
```ts
afterEach(async () => {
  await apiClient.deleteUser();
});
```
Choose the strategy based on environment constraints.


## Authentication State

Repeated UI login slows down test execution.

Use Playwright authentication state reuse:
```
storageState.json
```

This speeds up stable authentication scenarios significantly.

However, avoid sharing mutable authenticated sessions across parallel tests.

## Parallel Execution
Parallel execution requires collision-safe data.
Avoid:
```
qa@test.com
```

Prefer:
```
qa-${crypto.randomUUID()}@test.com
```

Shared static data becomes a major source of failures as suites scale.

## Recommended Structure
A clean minimal setup:
```
utils/
  apiClient.ts
  dataFactory.ts
  env.ts

fixtures/
  authenticatedUser.ts

test-data/
  static-users.json
```

## Final Takeaway
Reliable Playwright automation is not only about writing good tests.
It is about controlling test state.
Poor test data strategy is one of the biggest causes of flaky automation at scale.