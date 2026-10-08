import { Outlet } from "react-router-dom";
import { LayoutDashboard, NotebookPen, Users } from "lucide-react";
import Navbar, { type NavItem } from "@/components/layout/Navbar";

const PARENT_LINKS: NavItem[] = [
  { to: "/parent", label: "Tổng quan", end: true, icon: LayoutDashboard },
  { to: "/parent/children", label: "Trẻ", icon: Users },
  { to: "/parent/journal", label: "Nhật ký", end: true, icon: NotebookPen },
];

export default function ParentLayout() {
  return (
    <div className="min-h-dvh">
      <Navbar brandTo="/parent" links={PARENT_LINKS} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
