import type { Todo } from '../types/todo';
import TodoItem from '../components/TodoItem';

interface TodoListProps {
  todos: Todo[];
  searchQuery: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, searchQuery, onToggle, onDelete }: TodoListProps) {
  const filteredTodos = todos.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredTodos.length === 0) {
    return (
      <p className="text-[#646262] font-mono text-[16px] text-center py-4">
        No tasks found
      </p>
    );
  }

  return (
    <div>
      {filteredTodos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}
