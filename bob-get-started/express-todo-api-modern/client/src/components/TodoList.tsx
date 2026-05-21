import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const styles = {
  container: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: '16px',
  },
};

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No todos yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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

// Made with Bob
