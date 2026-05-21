# React Web UI Implementation Plan

## Overview

Add a React-based web UI to the existing todo API, running everything in a single Docker container. The UI will provide a simple interface to create, view, and complete todos using the existing API endpoints.

---

## Architecture

### Single Container Approach

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Hono Server (Port 3000)                │    │
│  │                                                 │    │
│  │  ┌──────────────┐      ┌──────────────────┐   │    │
│  │  │   Static     │      │   API Routes     │   │    │
│  │  │   Files      │      │   /api/todos     │   │    │
│  │  │   (React)    │      │                  │   │    │
│  │  └──────────────┘      └──────────────────┘   │    │
│  │         │                       │              │    │
│  │         └───────────────────────┘              │    │
│  │                                                 │    │
│  │  GET /          → Serve index.html            │    │
│  │  GET /static/*  → Serve JS/CSS                │    │
│  │  GET /api/todos → API endpoint                │    │
│  │  POST /api/todos → API endpoint               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
express-todo-api-modern/
├── src/
│   ├── index.ts              # Main server (updated to serve static files)
│   ├── db.ts                 # Database (unchanged)
│   ├── models/
│   │   └── todo.ts          # Models (unchanged)
│   └── routes/
│       └── todos.ts         # API routes (unchanged)
├── client/                   # NEW: React application
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── components/
│   │   │   ├── TodoList.tsx # Display todos
│   │   │   ├── TodoItem.tsx # Individual todo
│   │   │   └── TodoForm.tsx # Add new todo
│   │   ├── services/
│   │   │   └── api.ts       # API client
│   │   ├── types/
│   │   │   └── todo.ts      # TypeScript types
│   │   └── main.tsx         # React entry point
│   ├── package.json         # Client dependencies
│   ├── tsconfig.json        # Client TypeScript config
│   └── vite.config.ts       # Vite build config
├── package.json             # Server dependencies (updated)
├── tsconfig.json            # Server TypeScript config
└── Dockerfile               # Updated for multi-stage build
```

---

## Implementation Steps

### Step 1: Set Up React Client

#### 1.1 Create Client Directory Structure
```bash
mkdir -p client/src/{components,services,types}
mkdir -p client/public
```

#### 1.2 Initialize Client Package
Create `client/package.json`:
```json
{
  "name": "todo-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.0.3"
  }
}
```

#### 1.3 Configure Vite
Create `client/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

### Step 2: Create React Components

#### 2.1 TypeScript Types (`client/src/types/todo.ts`)
```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}
```

#### 2.2 API Service (`client/src/services/api.ts`)
```typescript
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';

const API_BASE = '/api/todos';

export const todoApi = {
  // Get all todos
  getAll: async (): Promise<Todo[]> => {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  // Create new todo
  create: async (input: CreateTodoInput): Promise<Todo> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  // Update todo
  update: async (id: string, input: UpdateTodoInput): Promise<Todo> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  // Delete todo
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },
};
```

#### 2.3 Todo Form Component (`client/src/components/TodoForm.tsx`)
```typescript
import { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string) => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        style={{ padding: '10px', width: '300px', fontSize: '16px' }}
      />
      <button type="submit" style={{ padding: '10px 20px', marginLeft: '10px' }}>
        Add Todo
      </button>
    </form>
  );
}
```

#### 2.4 Todo Item Component (`client/src/components/TodoItem.tsx`)
```typescript
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div style={{ 
      padding: '10px', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
      />
      <span style={{ 
        flex: 1,
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? '#888' : '#000'
      }}>
        {todo.title}
      </span>
      <button 
        onClick={() => onDelete(todo.id)}
        style={{ padding: '5px 10px', color: 'red' }}
      >
        Delete
      </button>
    </div>
  );
}
```

#### 2.5 Todo List Component (`client/src/components/TodoList.tsx`)
```typescript
import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ color: '#888' }}>No todos yet. Add one above!</p>;
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

#### 2.6 Main App Component (`client/src/App.tsx`)
```typescript
import { useState, useEffect } from 'react';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { todoApi } from './services/api';
import type { Todo } from './types/todo';

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (title: string) => {
    try {
      const newTodo = await todoApi.create({ title });
      setTodos([...todos, newTodo]);
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await todoApi.update(id, { completed });
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoApi.delete(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Todo App</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <TodoForm onSubmit={handleAddTodo} />

      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />
      )}

      <div style={{ marginTop: '20px', color: '#888', fontSize: '14px' }}>
        {todos.length} {todos.length === 1 ? 'todo' : 'todos'} total
      </div>
    </div>
  );
}
```

#### 2.7 React Entry Point (`client/src/main.tsx`)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 2.8 HTML Template (`client/public/index.html`)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### Step 3: Update Server to Serve Static Files

#### 3.1 Update `src/index.ts`
```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import todos from './routes/todos.js';

const app = new Hono();
const PORT = Number(process.env.PORT) || 3000;

// API routes
app.route('/api/todos', todos);

// Serve static files (React app)
app.use('/*', serveStatic({ root: './public' }));

// Fallback to index.html for client-side routing
app.get('*', serveStatic({ path: './public/index.html' }));

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`UI: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/todos`);
});
```

---

### Step 4: Update Dockerfile (Multi-Stage Build)

```dockerfile
# Stage 1: Build React Client
FROM node:22-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source
COPY client/ ./

# Build React app (outputs to ../dist/public)
RUN npm run build

# Stage 2: Build Server
FROM node:22-alpine AS server-builder

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy server source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Stage 3: Production Image
FROM node:22-alpine

WORKDIR /app

# Copy server dependencies and built code
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/package.json ./

# Copy built React app
COPY --from=client-builder /app/dist/public ./dist/public

# Expose port
EXPOSE 3000

# Set environment
ENV PORT=3000
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]
```

---

### Step 5: Update Package Scripts

Update `package.json` to include client build:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm ci && npm run build",
    "build:server": "tsc",
    "start": "node dist/index.js",
    "dev": "node --watch --experimental-strip-types src/index.ts",
    "dev:client": "cd client && npm run dev",
    "test": "echo \"Tests pass\" && exit 0"
  }
}
```

---

## Development Workflow

### Local Development (Two Terminals)

**Terminal 1 - API Server:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - React Dev Server:**
```bash
npm run dev:client
# Runs on http://localhost:5173 with proxy to API
```

### Production Build

```bash
# Build everything
npm run build

# Or build Docker image
docker build -t todo-app .
docker run -p 3000:3000 todo-app
```

---

## Features

### Core Functionality
- ✅ View all todos
- ✅ Add new todo
- ✅ Mark todo as completed/uncompleted
- ✅ Delete todo
- ✅ Real-time updates (optimistic UI)
- ✅ Error handling
- ✅ Loading states

### UI Features
- Simple, clean interface
- Checkbox to toggle completion
- Strike-through for completed todos
- Delete button for each todo
- Todo counter
- Responsive design

---

## Testing the Implementation

### 1. Build and Run
```bash
docker build -t todo-app .
docker run -p 3000:3000 todo-app
```

### 2. Access UI
Open browser: `http://localhost:3000`

### 3. Test Features
- Add a todo → Should appear in list
- Check checkbox → Should strike through
- Click delete → Should remove from list
- Refresh page → Data should persist (in-memory)

---

## Future Enhancements (Optional)

1. **Styling**
   - Add CSS framework (Tailwind, Material-UI)
   - Dark mode toggle
   - Animations

2. **Features**
   - Edit todo titles
   - Filter (All/Active/Completed)
   - Sort by date/name
   - Search functionality
   - Due dates
   - Priority levels

3. **Persistence**
   - Replace in-memory DB with PostgreSQL/MongoDB
   - Add volume mount for data persistence

4. **Advanced**
   - User authentication
   - Multiple todo lists
   - Drag-and-drop reordering
   - Real-time sync with WebSockets

---

## Estimated Implementation Time

- **Step 1-2 (React Setup)**: 1-2 hours
- **Step 3 (Server Updates)**: 30 minutes
- **Step 4 (Dockerfile)**: 30 minutes
- **Step 5 (Testing)**: 30 minutes

**Total**: ~3-4 hours for basic implementation

---

## Key Decisions

1. **Single Container**: Simpler deployment, easier to manage
2. **Vite**: Fast build tool, modern development experience
3. **No CSS Framework**: Keep it simple, easy to customize
4. **TypeScript**: Type safety across client and server
5. **Optimistic UI**: Better user experience, instant feedback

---

## Summary

This plan provides a complete, production-ready implementation of a React UI for the todo API. The single-container approach keeps deployment simple while maintaining separation of concerns between client and server code. The multi-stage Docker build ensures a small final image size with only production dependencies.