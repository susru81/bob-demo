# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Project Details

### Framework & Runtime
- Uses **Hono** (not Express despite project name) - lightweight web framework
- Requires **Node.js 22+** for native TypeScript support via `--experimental-strip-types`
- ES modules only (`"type": "module"` in package.json)

### Development Workflow
- Dev mode: `npm run dev` uses Node's `--watch` flag with experimental TypeScript stripping (no build step)
- Production: Must run `npm run build` first, then `npm start` (runs compiled JS from dist/)
- All imports MUST include `.js` extension even for `.ts` files (ES module requirement)

### Code Patterns
- Database uses singleton pattern: `export const db = new TodoDatabase()` in src/db.ts
- Routes export default Hono instance, not Express Router
- Type imports use `import type` syntax for better tree-shaking
- UUIDs generated via native `crypto.randomUUID()` (no external library)

### Critical Gotchas
- Import paths must end with `.js` even when importing from `.ts` files (NodeNext module resolution)
- Route handlers return `c.json()` not `res.json()` (Hono context pattern)
- DELETE returns `new Response(null, { status: 204 })` not `res.status(204).send()`
- Input validation done manually (no validation library like Zod)