import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const styles = {
  item: {
    padding: '16px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background 0.2s',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#3b82f6',
  },
  text: {
    flex: 1,
    fontSize: '16px',
    color: '#ffffff',
  },
  textCompleted: {
    flex: 1,
    fontSize: '16px',
    textDecoration: 'line-through',
    color: '#64748b',
  },
  deleteButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div 
      style={styles.item}
      onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        style={styles.checkbox}
      />
      <span style={todo.completed ? styles.textCompleted : styles.text}>
        {todo.title}
      </span>
      <button 
        onClick={() => onDelete(todo.id)}
        style={styles.deleteButton}
        onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
      >
        Delete
      </button>
    </div>
  );
}

// Made with Bob
