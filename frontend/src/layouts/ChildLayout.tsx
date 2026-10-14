import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bot, ListChecks, Loader2, PawPrint, User } from "lucide-react";
import Navbar, { type NavItem } from "@/components/layout/Navbar";
import ProfilePage from "@/pages/child/ProfilePage";
import { fetchMe } from "@/api/auth";
import {
  clearAuth,
  getRole,
  getStoredUserName,
  getStoredUserPicture,
  getToken,
  storeProfileId,
} from "@/lib/auth";
import type { Child } from "@/types/child";

const CHILD_LINKS: NavItem[] = [
  { to: "/child", label: "Góc của bé", end: true, icon: PawPrint },
  { to: "/child/tasks", label: "Nhiệm vụ", end: true, icon: ListChecks },
  { to: "/child/chat", label: "Trò chuyện AI", end: true, icon: Bot },
  { to: "/child/profile", label: "Hồ sơ", end: true, icon: User },
];

export default function ChildLayout() {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    if (!getToken() || getRole() !== "child") {
      navigate("/login", { replace: true });
      return;
    }
    fetchMe()
      .then((result) => {
        if (cancelled) return;
        if (result.role !== "child") {
          navigate("/login", { replace: true });
          return;
        }
        if (result.profile) {
          const profile = result.profile as Child;
          storeProfileId("child", profile._id);
          setChild(profile);
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

  const handleProfiled = useCallback((profiled: Child) => {
    storeProfileId("child", profiled._id);
    setChild(profiled);
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

  if (!child) {
    return (
      <div className="min-h-dvh">
        <Navbar
          brandTo="/child"
          links={CHILD_LINKS}
          user={{
            name: getStoredUserName() ?? "",
            picture: getStoredUserPicture() ?? undefined,
          }}
          onLogout={handleLogout}
        />
        <main>
          <ProfilePage onProfiled={handleProfiled} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Navbar
        brandTo="/child"
        links={CHILD_LINKS}
        user={{
          name: child.name || (getStoredUserName() ?? ""),
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
