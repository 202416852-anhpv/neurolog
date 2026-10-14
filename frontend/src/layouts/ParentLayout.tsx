import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Loader2,
  NotebookPen,
  Users,
} from "lucide-react";
import Navbar, { type NavItem } from "@/components/layout/Navbar";
import ParentSetupForm from "@/components/parent/ParentSetupForm";
import { fetchMe } from "@/api/auth";
import {
  clearAuth,
  getRole,
  getStoredUserName,
  getStoredUserPicture,
  getToken,
} from "@/lib/auth";
import { storeParentId } from "@/lib/parent";
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
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    if (!getToken() || getRole() !== "parent") {
      navigate("/login", { replace: true });
      return;
    }
    fetchMe()
      .then((result) => {
        if (cancelled) return;
        if (result.role !== "parent") {
          navigate("/login", { replace: true });
          return;
        }
        if (result.profile) {
          const profile = result.profile as Parent;
          storeParentId(profile._id);
          setParent(profile);
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearAuth();
        navigate("/login", { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleCreated = useCallback((created: Parent) => {
    storeParentId(created._id);
    setParent(created);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/login", { replace: true });
  }, [navigate]);

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
      <Navbar
        brandTo="/parent"
        links={PARENT_LINKS}
        user={{
          name: parent.name || (getStoredUserName() ?? ""),
          picture: getStoredUserPicture() ?? undefined,
        }}
        onLogout={handleLogout}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
