import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PawPrint, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginWithGoogle } from "@/api/auth";
import {
  roleHome,
  setAuth,
  storeProfileId,
  type AuthRole,
} from "@/lib/auth";
import { renderGoogleButton } from "@/lib/google";

const ROLE_LABEL: Record<AuthRole, string> = {
  parent: "Phụ huynh",
  child: "Trẻ em",
};

export default function LoginPage() {
  const [role, setRole] = useState<AuthRole | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!role || !buttonRef.current) return;
    let cancelled = false;
    const container = buttonRef.current;
    container.innerHTML = "";
    renderGoogleButton(
      container,
      async (credential) => {
        if (cancelled) return;
        setBusy(true);
        setError(null);
        try {
          const result = await loginWithGoogle(credential, role);
          if (cancelled) return;
          const profileEmail =
            result.profile && "email" in result.profile
              ? (result.profile.email ?? "")
              : "";
          setAuth(result.token, result.role, {
            name: result.profile
              ? result.profile.name
              : (result.suggested?.name ?? ""),
            email: profileEmail || result.suggested?.email || "",
            picture: result.suggested?.picture ?? "",
          });
          if (result.profile) {
            storeProfileId(result.role, result.profile._id);
          }
          navigate(roleHome(result.role), { replace: true });
        } catch {
          if (!cancelled) {
            setError("Đăng nhập thất bại, vui lòng thử lại");
            setBusy(false);
          }
        }
      },
      (message) => {
        if (!cancelled) {
          setError(message);
          setBusy(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [role, navigate]);

  if (role) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6">
        <div className="mb-6 w-full text-center">
          <h1 className="text-xl font-bold">Đăng nhập bằng Google</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Bạn đang đăng nhập với tư cách{" "}
            <span className="font-semibold text-foreground">
              {ROLE_LABEL[role].toLowerCase()}
            </span>
          </p>
        </div>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            {busy ? (
              <div className="flex items-center gap-2 py-6 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Đang đăng nhập...
              </div>
            ) : (
              <div ref={buttonRef} className="flex min-h-10 justify-center" />
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => {
                setRole(null);
                setError(null);
              }}
              disabled={busy}
            >
              <ArrowLeft className="size-4" />
              Chọn lại vai trò
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold">NeuroLog</h1>
        <p className="text-muted-foreground mt-2 text-sm">Bạn là ai?</p>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Phụ huynh
            </CardTitle>
            <CardDescription>
              Giao việc, duyệt, xem nhật ký, báo cáo và trò chuyện với trợ lý AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setRole("parent")}>
              Đăng nhập phụ huynh
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="size-5" />
              Trẻ em
            </CardTitle>
            <CardDescription>
              Làm nhiệm vụ, nuôi thú cưng, xem hồ sơ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setRole("child")}>
              Đăng nhập bé
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
