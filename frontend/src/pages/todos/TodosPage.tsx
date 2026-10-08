import { useState, useCallback, useEffect, useRef } from "react";
import type { Todo } from "../../types/todo";
import {
  fetchTodos,
  createTodo,
  deleteTodo,
  toggleTodo,
} from "../../api/todo";
import TodoInput from "../../components/TodoInput";
import SearchBar from "../../components/SearchBar";
import TodoList from "../../containers/TodoList";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTodos()
      .then((data) => {
        if (!cancelled) setTodos(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load todos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const debouncedSetSearch = useCallback((val: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setSearchQuery(val), 400);
  }, []);

  const handleAdd = async () => {
    if (!titleInput.trim()) return;
    try {
      const newTodo = await createTodo(titleInput.trim());
      setTodos((prev) => [newTodo, ...prev]);
      setTitleInput("");
    } catch {
      setError("Failed to add todo");
    }
  };

  const handleToggle = useCallback(async (id: string) => {
    try {
      const updated = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch {
      setError("Failed to toggle todo");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError("Failed to delete todo");
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 font-mono">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#201d1d]">Todo App</h1>
      </div>
      <SearchBar
        value={inputValue}
        onChange={(val) => {
          setInputValue(val);
          debouncedSetSearch(val);
        }}
      />
      <TodoInput value={titleInput} onChange={setTitleInput} onAdd={handleAdd} />
      {error && (
        <p className="text-red-600 font-mono text-base mb-4">{error}</p>
      )}
      {loading ? (
        <p className="text-[#9a9898] font-mono text-base">Loading...</p>
      ) : (
        <TodoList
          todos={todos}
          searchQuery={searchQuery}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
