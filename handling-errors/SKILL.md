---
name: handling-errors
description: Implements robust error handling patterns across languages including exceptions, Result types, and graceful degradation. Use when the user asks to implement error handling, design APIs, debug production issues, or improve application reliability.
---

# Handling Errors

## When to use this skill
- When implementing error handling in new or existing features.
- When designing APIs that need to handle and report failures resiliently.
- When debugging production issues related to unhandled exceptions.
- When improving application reliability (e.g., adding retries, circuit breakers, or graceful degradation).

## Workflow
- [ ] **1. Identify Error Philosophy**: Determine if the current language/framework favors Exceptions (Python, Java), Result Types (Rust, TypeScript), or Explicit Error Returns (Go).
- [ ] **2. Categorize Errors**: Decide if the error is recoverable (e.g., network timeout) or unrecoverable (e.g., out of memory, programming bugs).
- [ ] **3. Implement Base Hierarchy**: If using exceptions, establish a custom base exception type (e.g., `ApplicationError`) if one does not exist.
- [ ] **4. Apply Robust Patterns**: Use Context Managers/defers for cleanup, Exponential Backoff for external calls, or Circuit Breakers for distributed systems.
- [ ] **5. Add Context**: Ensure errors preserve stack traces, metadata, and timestamps without inappropriately swallowing underlying errors.

## Instructions

### Python Error Handling
* **Custom Exceptions**: Inherit from `Exception` to create an `ApplicationError`, then derive specific errors (`ValidationError`, `NotFoundError`).
* **Context Managers**: Use `@contextmanager` for resource cleanup (e.g., database transactions) to guarantee commit/rollback/close.
* **Retries**: Implement decorators for exponential backoff on `NetworkError` or other transient expected failures.

### TypeScript / JavaScript Error Handling
* **Custom Error Classes**: Extend `Error`, ensure to use `Error.captureStackTrace(this, this.constructor)` if available.
* **Result Types (Functional Approach)**: Define a `Result<T, E>` type with `Ok` and `Err` helpers to force explicit error handling instead of relying heavily on `try/catch`.
* **Error Collectors**: Use `AggregateError` to collect multiple validation errors before failing, rather than failing on the first error.

### Rust and Go Patterns
* **Rust**: Leverage `Result<T, E>` and `Option<T>` alongside the `?` operator. Implement `From` to auto-convert error types (e.g., `std::io::Error` to `AppError`).
* **Go**: Return `(type, error)` explicitly. Use `fmt.Errorf("...: %w", err)` to wrap errors, and `errors.Is` / `errors.As` to check for specific sentinel types and unwrap structures.

### Advanced Patterns to Consider
* **Circuit Breaker**: Maintain a state machine (CLOSED, OPEN, HALF_OPEN) to prevent cascading failures when an external service is down.
* **Graceful Degradation**: Attempt primary logic, but fall back to a cache or defaults if the primary logic throws an exception.

### Best Practices & Pitfalls to Avoid
* **Do**: Fail fast, preserve context, return meaningful messages, log appropriately (error = log, expected failure = don't spam), and clean up resources (`finally`, `defer`).
* **Evaluation Safety**: In Next.js/Vite, avoid throwing errors at the top-level module scope (e.g., in a `firebase.ts` file that evaluates as soon as it's imported). Instead, use a `Result` pattern or a getter function that returns a handled error to prevent the entire build or process from crashing during initialization.
* **Do Not**: Catch `Exception` broadly without re-raising or logging, use empty catch blocks, or log *and* re-throw (which creates duplicate log logs).
