# Code Mode Rules (Non-Obvious Only)

## Import Requirements
- ALL imports must end with `.js` extension, even when importing `.ts` files
- Use `import type` for type-only imports (e.g., `import type { Todo } from './models/todo.js'`)
- This is due to NodeNext module resolution - forgetting `.js` causes runtime errors

## Hono Framework Patterns
- Return `c.json(data)` not `res.json(data)` - context object is `c`, not `req`/`res`
- For 204 responses: `return new Response(null, { status: 204 })` not `res.status(204).send()`
- Route mounting: `app.route('/path', routerInstance)` not `app.use('/path', router)`

## Database Singleton
- Database is singleton exported from src/db.ts: `export const db = new TodoDatabase()`
- Import as: `import { db } from '../db.js'` (not a class to instantiate)
- Uses Map internally, not array - affects iteration patterns

## Validation
- No validation library (Zod, Joi, etc.) - manual validation required
- Pattern: `if (!input.title?.trim()) return c.json({ error: 'Title is required' }, 400)`
- Always trim string inputs before saving

## No Access to MCP or Browser Tools
- Code mode is restricted to file operations and command execution only