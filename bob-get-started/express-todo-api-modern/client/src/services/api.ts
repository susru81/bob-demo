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

// Made with Bob
