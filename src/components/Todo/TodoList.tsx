import React, { useState } from 'react';
import { Plus, Trash2, Check, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { storageService } from '../../lib/StorageService';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, 'id'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#2196f3' },
  { id: 'personal', name: 'Personal', color: '#ff9800' },
  { id: 'shopping', name: 'Shopping', color: '#4caf50' },
  { id: 'health', name: 'Health', color: '#f44336' },
];

const PRIORITIES = {
  low: { label: 'Low', color: '#4caf50' },
  medium: { label: 'Medium', color: '#ff9800' },
  high: { label: 'High', color: '#f44336' },
};

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const { user, updateUser } = useAuth();
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Todo['priority']>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState<string>(CATEGORIES[0].id);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    onAddTodo({
      text: newTodoText,
      completed: false,
      dueDate: newTodoDueDate ? new Date(newTodoDueDate) : undefined,
      priority: newTodoPriority,
      category: newTodoCategory,
    });

    setNewTodoText('');
    setNewTodoDueDate('');
    setNewTodoPriority('medium');
    setShowAddForm(false);
  };

  const handleToggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed && user) {
      // Award 1 XP for completing a task and update streak
      const result = storageService.addXP(user.id, 1);
      if (result.leveledUp) {
        alert(`Congratulations! You've reached level ${result.level}!`);
      }
      if (result.streakUpdated) {
        alert(`Great job! Your streak is now ${result.level} days! 🔥`);
      }
      // Update the user object in the AuthContext
      updateUser({
        xp: result.xp,
        level: result.level,
        currentStreak: user.currentStreak,
        lastActivityDate: user.lastActivityDate,
        longestStreak: user.longestStreak
      });
    }
    onToggleTodo(id);
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    return PRIORITIES[priority].color;
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId)?.color || '#9e9e9e';
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as Todo['priority'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PRIORITIES).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label} Priority
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={newTodoDueDate}
                onChange={(e) => setNewTodoDueDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Task
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
          >
            <button
              onClick={() => handleToggleTodo(todo.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                todo.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {todo.completed && <Check size={12} className="text-white" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`flex-1 text-sm ${
                    todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                {todo.category && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${getCategoryColor(todo.category)}20`, color: getCategoryColor(todo.category) }}
                  >
                    {CATEGORIES.find(cat => cat.id === todo.category)?.name}
                  </span>
                )}
                {todo.dueDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDueDate(new Date(todo.dueDate))}
                  </span>
                )}
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: getPriorityColor(todo.priority) }}
                >
                  <Clock size={12} />
                  {PRIORITIES[todo.priority].label}
                </span>
              </div>
            </div>
          </div>
        ))}

        {todos.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No tasks yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList; 