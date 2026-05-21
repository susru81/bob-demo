import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import todos from './routes/todos.js';

const app = new Hono();
const PORT = Number(process.env.PORT) || 3000;

// API routes
app.route('/api/todos', todos);

// Serve static files (React app)
app.use('/*', serveStatic({ root: './dist/public' }));

// Fallback to index.html for client-side routing
app.get('*', serveStatic({ path: './dist/public/index.html' }));

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`UI: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/todos`);
});

// Made with Bob
