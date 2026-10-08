import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import ParentPage from "@/pages/parent/ParentPage";
import JournalPage from "@/pages/parent/JournalPage";
import ChildPage from "@/pages/child/ChildPage";
import TasksPage from "@/pages/child/TasksPage";
import ChatPage from "@/pages/child/ChatPage";
import ChildrenPage from "@/pages/parent/ChildrenPage";
import ChildDetailPage from "@/pages/parent/ChildDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ParentLayout from "@/layouts/ParentLayout";
import ChildLayout from "@/layouts/ChildLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ParentLayout />}>
        <Route path="/parent" element={<ParentPage />} />
        <Route path="/parent/journal" element={<JournalPage />} />
        <Route path="/parent/children" element={<ChildrenPage />} />
        <Route path="/parent/children/:id" element={<ChildDetailPage />} />
      </Route>
      <Route element={<ChildLayout />}>
        <Route path="/child" element={<ChildPage />} />
        <Route path="/child/tasks" element={<TasksPage />} />
        <Route path="/child/chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
