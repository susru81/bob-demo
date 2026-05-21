# Ask Mode Rules (Non-Obvious Only)

## Project Naming Confusion
- Project is named "express-todo-api-modern" but uses **Hono framework**, not Express
- This is intentional - demonstrates modernization from Express to Hono
- Don't assume Express patterns apply

## Development Setup
- Requires Node.js 22+ (not 18 or 20) for `--experimental-strip-types` flag
- Dev mode runs TypeScript directly without compilation step
- Production requires explicit build step before running

## Architecture Decisions
- In-memory Map-based database (not persistent storage)
- No external validation library - manual validation throughout
- Native crypto.randomUUID() instead of uuid package
- ES modules only - affects all import/export syntax

## File Organization
- Routes in src/routes/ export default Hono instances
- Models in src/models/ are pure TypeScript interfaces
- Database logic centralized in single src/db.ts file
- No separate services layer - business logic in routes