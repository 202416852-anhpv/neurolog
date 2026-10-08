import { Outlet } from "react-router-dom";
import { Bot, ListChecks, PawPrint } from "lucide-react";
import Navbar, { type NavItem } from "@/components/layout/Navbar";

const CHILD_LINKS: NavItem[] = [
  { to: "/child", label: "Góc của bé", end: true, icon: PawPrint },
  { to: "/child/tasks", label: "Nhiệm vụ", end: true, icon: ListChecks },
  { to: "/child/chat", label: "Trò chuyện AI", end: true, icon: Bot },
];

export default function ChildLayout() {
  return (
    <div className="min-h-dvh">
      <Navbar brandTo="/child" links={CHILD_LINKS} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
