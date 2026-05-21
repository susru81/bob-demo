import { useState, useEffect } from 'react';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { todoApi } from './services/api';
import type { Todo } from './types/todo';

const styles = {
  container: {
    padding: '40px 20px',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    fontWeight: '400',
  },
  errorBox: {
    background: '#dc2626',
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  loading: {
    color: '#94a3b8',
    fontSize: '16px',
  },
  footer: {
    marginTop: '24px',
    padding: '16px',
    background: '#1e293b',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  count: {
    color: '#ffffff',
    fontWeight: '600',
  },
};

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Todo App</h1>
        <p style={styles.subtitle}>Manage your tasks efficiently</p>
      </div>
      
      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      <TodoForm onSubmit={handleAddTodo} />

      {loading ? (
        <p style={styles.loading}>Loading todos...</p>
      ) : (
        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />
      )}

      <div style={styles.footer}>
        <div style={styles.footerText}>
          <span style={styles.count}>{todos.length}</span> {todos.length === 1 ? 'todo' : 'todos'} total
        </div>
      </div>
    </div>
  );
}

// Made with Bob
