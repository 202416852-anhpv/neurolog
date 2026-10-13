import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Loader2,
  NotebookPen,
  Users,
} from "lucide-react";
import Navbar, { type NavItem } from "@/components/layout/Navbar";
import ParentSetupForm from "@/components/parent/ParentSetupForm";
import { fetchCurrentParent, storeParentId } from "@/lib/parent";
import type { Parent } from "@/types/parent";

const PARENT_LINKS: NavItem[] = [
  { to: "/parent", label: "Tổng quan", end: true, icon: LayoutDashboard },
  { to: "/parent/tasks", label: "Nhiệm vụ", end: true, icon: ListChecks },
  { to: "/parent/children", label: "Trẻ", icon: Users },
  { to: "/parent/journal", label: "Nhật ký", end: true, icon: NotebookPen },
];

export default function ParentLayout() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentParent()
      .then((data) => {
        if (!cancelled) setParent(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreated = (created: Parent) => {
    storeParentId(created._id);
    setParent(created);
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tải...
      </div>
    );
  }

  if (!parent) {
    return <ParentSetupForm onCreated={handleCreated} />;
  }

  return (
    <div className="min-h-dvh">
      <Navbar brandTo="/parent" links={PARENT_LINKS} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
