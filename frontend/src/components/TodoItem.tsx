import type { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div
      className={`flex items-center gap-3 py-2 font-mono ${
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <span
        onClick={() => onToggle(todo._id)}
        className="w-9 h-9 flex items-center justify-center shrink-0 cursor-pointer select-none text-base"
      >
        {todo.completed ? "[v]" : "[ ]"}
      </span>
      <span
        className={`flex-1 text-[16px] ${todo.completed ? "line-through" : ""}`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo._id)}
        className="w-9 h-9 text-[#646262] active:text-[#ff3b30] shrink-0 flex items-center justify-center"
      >
        <span className="font-mono text-[16px]">[-]</span>
      </button>
    </div>
  );
}
