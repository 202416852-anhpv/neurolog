import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import ParentPage from "../pages/parent/ParentPage";
import JournalPage from "../pages/parent/JournalPage";
import ChildPage from "../pages/child/ChildPage";
import TasksPage from "../pages/child/TasksPage";
import ChatPage from "../pages/child/ChatPage";
import TodosPage from "../pages/todos/TodosPage";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/parent" element={<ParentPage />} />
      <Route path="/parent/journal" element={<JournalPage />} />
      <Route path="/child" element={<ChildPage />} />
      <Route path="/child/tasks" element={<TasksPage />} />
      <Route path="/child/chat" element={<ChatPage />} />
      <Route path="/todos" element={<TodosPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
