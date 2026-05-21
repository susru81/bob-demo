# Plan Mode Rules (Non-Obvious Only)

## Architecture Constraints
- Database is singleton Map instance - not designed for concurrent access or persistence
- No middleware layer - validation and error handling done inline in routes
- No dependency injection - direct imports of singleton db instance
- Stateless by design - all state in memory, lost on restart

## Framework Migration Context
- Project demonstrates Express → Hono migration pattern
- Hono chosen for: lightweight, edge-ready, better TypeScript support
- Breaking changes from Express: context object (`c`) vs `req`/`res` pattern

## Scalability Considerations
- In-memory storage limits horizontal scaling
- No connection pooling or external database
- UUID generation via native crypto (no external dependencies)
- Single-file database class - would need refactoring for real persistence

## Testing Strategy
- No test framework configured (test script is placeholder)
- No mocking utilities or test database setup
- Would need to add vitest/jest and mock the db singleton for unit tests

## Performance Patterns
- Map-based storage for O(1) lookups by ID
- Array.from() conversion for getAll() - creates new array each time
- No caching layer or query optimization