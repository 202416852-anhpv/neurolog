import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarDays,
  Eye,
  EyeOff,
  HeartPulse,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loginWithGoogle,
  loginWithPassword,
  registerAccount,
  type LoginResponse,
} from "@/api/auth";
import {
  roleHome,
  setAuth,
  storeProfileId,
  type AuthRole,
} from "@/lib/auth";
import { renderGoogleButton } from "@/lib/google";

type AuthMode = "login" | "register";
type AuthMethod = "account" | "google";

interface FormState {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  age: string;
  email: string;
}

const EMPTY_FORM: FormState = {
  username: "",
  password: "",
  confirmPassword: "",
  name: "",
  age: "",
  email: "",
};

const getApiError = (error: unknown, fallback: string): string => {
  const message = (
    error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message;
  switch (message) {
    case "INVALID_CREDENTIAL":
      return "Tên đăng nhập hoặc mật khẩu không đúng";
    case "USERNAME_TAKEN":
      return "Tên đăng nhập đã được sử dụng";
    case "EMAIL_IN_USE":
      return "Email này đã được sử dụng";
    case "VALIDATION_FAILED":
      return "Thông tin chưa hợp lệ, bạn kiểm tra lại nhé";
    default:
      return fallback;
  }
};

export default function LoginPage() {
  const [role, setRole] = useState<AuthRole | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [method, setMethod] = useState<AuthMethod>("account");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const finishAuth = useCallback(
    (result: LoginResponse) => {
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
    },
    [navigate],
  );

  const handleGoogleCredential = useCallback(
    async (credential: string, selectedRole: AuthRole) => {
      setBusy(true);
      setError(null);
      try {
        const result = await loginWithGoogle(credential, selectedRole);
        finishAuth(result);
      } catch (err) {
        setError(getApiError(err, "Đăng nhập Google thất bại, vui lòng thử lại"));
        setBusy(false);
      }
    },
    [finishAuth],
  );

  useEffect(() => {
    if (!role || method !== "google" || mode !== "login") return;
    const container = googleRef.current;
    if (!container) return;
    let cancelled = false;
    container.innerHTML = "";
    renderGoogleButton(
      container,
      (credential) => {
        if (!cancelled) void handleGoogleCredential(credential, role);
      },
      (message) => {
        if (!cancelled) setError(message);
      },
    ).catch(() => {
      if (!cancelled) setError("Không tải được Google Sign-In");
    });
    return () => {
      cancelled = true;
    };
  }, [role, mode, method, handleGoogleCredential]);

  const resetToRoleSelect = () => {
    setRole(null);
    setMode("login");
    setMethod("account");
    setError(null);
    setForm(EMPTY_FORM);
    setBusy(false);
  };

  const handleAccountSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role) return;
    setError(null);

    if (method !== "account") return;

    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Bạn nhập tên của mình nhé");
        return;
      }
      const age = Number(form.age);
      if (!Number.isInteger(age) || age < 1 || age > (role === "child" ? 18 : 100)) {
        setError(
          role === "child"
            ? "Tuổi của bé phải từ 1 đến 18"
            : "Tuổi phải là số nguyên từ 1 đến 100",
        );
        return;
      }
      if (role === "parent" && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
        setError("Bạn nhập email hợp lệ nhé");
        return;
      }
      if (!/^[a-zA-Z0-9._-]{3,30}$/.test(form.username.trim())) {
        setError(
          "Tên đăng nhập gồm 3-30 ký tự: chữ, số, dấu chấm, gạch dưới hoặc gạch ngang",
        );
        return;
      }
      if (form.password.length < 8) {
        setError("Mật khẩu cần ít nhất 8 ký tự");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Mật khẩu nhập lại chưa khớp");
        return;
      }
    }

    if (mode === "login") {
      if (!form.username.trim() || !form.password) {
        setError("Bạn nhập đầy đủ tên đăng nhập và mật khẩu nhé");
        return;
      }
    }

    setBusy(true);
    try {
      const result =
        mode === "login"
          ? await loginWithPassword({
              username: form.username.trim(),
              password: form.password,
              role,
            })
          : await registerAccount({
              username: form.username.trim(),
              password: form.password,
              role,
              name: form.name.trim(),
              age: Number(form.age),
              ...(role === "parent" ? { email: form.email.trim() } : {}),
            });
      finishAuth(result);
    } catch (err) {
      setError(
        getApiError(
          err,
          mode === "login"
            ? "Đăng nhập thất bại, vui lòng thử lại"
            : "Tạo tài khoản thất bại, vui lòng thử lại",
        ),
      );
      setBusy(false);
    }
  };

  if (!role) {
    return (
      <div className="bg-background relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-24 size-64 rounded-full bg-secondary-container/40 blur-3xl" />
        <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
          <BrandPanel />
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col lg:min-h-0 lg:max-w-lg lg:justify-center">
          <header className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-2xl shadow-sm">
                <Brain className="size-5" />
              </span>
              <div>
                <p className="text-lg leading-tight font-extrabold tracking-tight">
                  NeuroLog
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Chăm sóc thần kinh gia đình
                </p>
              </div>
            </div>
            <span className="bg-card text-muted-foreground flex size-10 items-center justify-center rounded-full border shadow-sm">
              <ShieldCheck className="size-5 text-primary" />
            </span>
          </header>

          <div className="from-primary-container to-primary relative my-6 overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg lg:hidden">
            <div className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-12 -left-6 size-36 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-3 border-white/20 bg-white/15 text-white">
                  <Sparkles className="size-3.5" />
                  Kết nối & Yêu thương
                </Badge>
                <h1 className="text-2xl leading-tight font-extrabold">
                  Đồng hành cùng con
                  <br />
                  mỗi ngày một chút
                </h1>
                <p className="mt-2 max-w-[16rem] text-sm text-white/80">
                  Theo dõi hành vi, nhật ký ABC và nhiệm vụ của bé trong một
                  không gian an toàn.
                </p>
              </div>
              <div className="relative hidden shrink-0 sm:block">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
                  <HeartPulse className="size-7" />
                </span>
                <span className="absolute -bottom-3 -left-6 flex size-10 items-center justify-center rounded-xl bg-white/15">
                  <PawPrint className="size-5" />
                </span>
              </div>
            </div>
          </div>

          <div className="mb-5 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Chào mừng đến với NeuroLog
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Chọn vai trò để bắt đầu hành trình đồng hành cùng sức khỏe thần
              kinh của gia đình bạn.
            </p>
          </div>

          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRole("parent");
                setError(null);
              }}
              className="group bg-card hover:border-primary/40 h-auto w-full items-start justify-start gap-3 rounded-2xl p-4 text-left whitespace-normal shadow-[0_2px_4px_rgba(15,23,42,0.02),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-md"
            >
              <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                <ShieldCheck className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Tôi là Phụ huynh</span>
                  <Badge className="bg-secondary-container/60 text-on-secondary-container">
                    Chăm sóc
                  </Badge>
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  Theo dõi nhật ký, nhiệm vụ và dữ liệu của con một cách chủ
                  động.
                </span>
              </span>
              <span className="bg-muted text-primary mt-1 flex size-9 shrink-0 items-center justify-center rounded-full transition group-hover:bg-primary group-hover:text-white">
                <ArrowRight className="size-4" />
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRole("child");
                setError(null);
              }}
              className="group bg-card hover:border-primary/40 h-auto w-full items-start justify-start gap-3 rounded-2xl p-4 text-left whitespace-normal shadow-[0_2px_4px_rgba(15,23,42,0.02),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-md"
            >
              <span className="bg-brand-yellow/20 text-brand-coral flex size-12 shrink-0 items-center justify-center rounded-xl">
                <PawPrint className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Góc của Bé</span>
                  <Badge className="bg-brand-yellow/20 text-brand-coral">
                    Vui vẻ
                  </Badge>
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  Nhật ký cảm xúc, nhiệm vụ và thu thập huy hiệu phần thưởng
                  vui.
                </span>
              </span>
              <span className="bg-muted text-primary mt-1 flex size-9 shrink-0 items-center justify-center rounded-full transition group-hover:bg-primary group-hover:text-white">
                <ArrowRight className="size-4" />
              </span>
            </Button>
          </div>

          <div className="text-muted-foreground mt-auto flex items-center justify-center gap-2 pt-8 text-xs lg:mt-8">
            <ShieldCheck className="size-4 text-primary" />
            Bảo mật dữ liệu & đồng hành cùng gia đình
          </div>
          </div>
        </div>
      </div>
    );
  }

  const isChild = role === "child";
  const isRegister = mode === "register";

  return (
    <div className="bg-background relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 size-64 rounded-full bg-secondary-container/40 blur-3xl" />
      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
        <BrandPanel />
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col lg:min-h-0 lg:max-w-lg lg:justify-center">
        <header className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-card size-10 rounded-full border shadow-sm"
            onClick={resetToRoleSelect}
            aria-label="Chọn lại vai trò"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="text-center lg:hidden">
            <div className="flex items-center justify-center gap-1.5">
              <Brain className="text-primary size-5" />
              <span className="font-extrabold tracking-tight">NeuroLog</span>
            </div>
            <p className="text-muted-foreground text-[11px] font-medium">
              {isChild ? "Góc của Bé" : "Phụ Huynh"}
            </p>
          </div>
          <span className="bg-card text-primary flex size-10 items-center justify-center rounded-full border shadow-sm">
            <ShieldCheck className="size-5" />
          </span>
        </header>

        <main className="flex flex-1 flex-col justify-center py-7">
          <div className="mb-5 text-center">
            <Badge className="mb-3 bg-secondary-container/50 text-on-secondary-container">
              <ShieldCheck className="size-3.5" />
              Bảo mật an toàn
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isRegister
                ? "Tạo tài khoản mới"
                : isChild
                  ? "Chào bé quay lại!"
                  : "Mừng bạn trở lại!"}
            </h1>
            <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-sm">
              {isRegister
                ? "Chỉ mất một phút để bắt đầu đồng hành cùng bé."
                : "Đăng nhập an toàn để tiếp tục theo dõi và đồng hành cùng bé."}
            </p>
          </div>

          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              {!isRegister && (
                <Tabs
                  value={method}
                  onValueChange={(value) => {
                    setMethod(value as AuthMethod);
                    setError(null);
                  }}
                  className="mb-5"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">
                      <KeyRound className="size-4" />
                      Tài khoản
                    </TabsTrigger>
                    <TabsTrigger value="google">
                      <GoogleMark className="size-4" />
                      Google
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {method === "google" && !isRegister ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <p className="text-muted-foreground max-w-xs text-center text-sm">
                    Dùng tài khoản Google của bạn để đăng nhập nhanh và an toàn.
                  </p>
                  <div ref={googleRef} className="flex min-h-11 justify-center" />
                  {busy && (
                    <span className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                      Đang đăng nhập...
                    </span>
                  )}
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={handleAccountSubmit}>
                  {isRegister && (
                    <>
                      <div className="grid gap-1.5">
                        <Label htmlFor="auth-name">
                          {isChild ? "Tên của bé" : "Tên của bạn"}
                        </Label>
                        <div className="relative">
                          <UserRound className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                          <Input
                            id="auth-name"
                            className="pl-9"
                            placeholder={isChild ? "VD: Bé Bo" : "VD: Nguyễn Lan Anh"}
                            value={form.name}
                            maxLength={100}
                            onChange={(e) => updateField("name", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="auth-age">Tuổi</Label>
                          <div className="relative">
                            <CalendarDays className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                              id="auth-age"
                              type="number"
                              min={1}
                              max={isChild ? 18 : 100}
                              className="pl-9"
                              placeholder={isChild ? "7" : "35"}
                              value={form.age}
                              onChange={(e) => updateField("age", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="auth-email">
                            Email {isChild ? "(tuỳ chọn)" : ""}
                          </Label>
                          <div className="relative">
                            <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                              id="auth-email"
                              type="email"
                              className="pl-9"
                              placeholder="ban@example.com"
                              value={form.email}
                              maxLength={200}
                              onChange={(e) => updateField("email", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid gap-1.5">
                    <Label htmlFor="auth-username">Tên đăng nhập</Label>
                    <div className="relative">
                      <UserRound className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        id="auth-username"
                        autoComplete="username"
                        className="pl-9"
                        placeholder="vd: lananh"
                        value={form.username}
                        maxLength={30}
                        onChange={(e) => updateField("username", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="auth-password">Mật khẩu</Label>
                    <div className="relative">
                      <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isRegister ? "new-password" : "current-password"}
                        className="pr-10 pl-9"
                        placeholder="Tối thiểu 8 ký tự"
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((value) => !value)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-full"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isRegister && (
                    <div className="grid gap-1.5">
                      <Label htmlFor="auth-confirm">Nhập lại mật khẩu</Label>
                      <div className="relative">
                        <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                          id="auth-confirm"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pl-9"
                          placeholder="Nhập lại mật khẩu"
                          value={form.confirmPassword}
                          onChange={(e) =>
                            updateField("confirmPassword", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full rounded-full text-base"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        {isRegister ? "Tạo tài khoản" : "Đăng nhập an toàn"}
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setMode(isRegister ? "login" : "register");
                setMethod("account");
                setError(null);
                setForm((current) => ({
                  ...EMPTY_FORM,
                  username: current.username,
                }));
              }}
              className="text-muted-foreground hover:text-primary h-auto p-0 text-sm font-normal"
            >
              {isRegister ? (
                <>
                  Đã có tài khoản?{" "}
                  <span className="text-primary font-semibold">
                    Đăng nhập ngay
                  </span>
                </>
              ) : (
                <>
                  Chưa có tài khoản?{" "}
                  <span className="text-primary font-semibold">
                    Đăng ký ngay
                  </span>
                </>
              )}
            </Button>
          </div>

          <div className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-xs">
            <ShieldCheck className="text-primary size-4" />
            {isChild
              ? "Không gian an toàn dành riêng cho bé"
              : "Bảo mật dữ liệu & tuân thủ nguyên tắc an toàn"}
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#004AC6] p-10 text-white shadow-xl lg:flex">
      <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <Brain className="size-6" />
          </span>
          <div>
            <p className="text-xl font-extrabold tracking-tight">NeuroLog</p>
            <p className="text-xs text-white/70">
              Chăm sóc thần kinh gia đình
            </p>
          </div>
        </div>

        <Badge className="mt-10 border-white/20 bg-white/15 text-white">
          <Sparkles className="size-3.5" />
          Đồng hành cùng gia đình
        </Badge>
        <h1 className="mt-4 text-4xl leading-[1.15] font-extrabold">
          Hiểu con hơn,
          <br />
          mỗi ngày một chút.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
          Theo dõi hành vi, nhật ký ABC và nhiệm vụ của bé trong một không gian
          an toàn, dễ dùng cho cả gia đình.
        </p>
      </div>

      <div className="relative mt-10 grid gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Nhật ký ABC rõ ràng</p>
            <p className="text-xs text-white/70">
              Ghi lại dẫn xuất, hành vi và hậu quả
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <HeartPulse className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Theo dõi tiến độ</p>
            <p className="text-xs text-white/70">
              Nhiệm vụ và thói quen của bé mỗi ngày
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <PawPrint className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Không gian riêng cho bé</p>
            <p className="text-xs text-white/70">
              Góc vui vẻ với thú cưng và phần thưởng
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-10 flex items-center gap-2 text-xs text-white/70">
        <ShieldCheck className="size-4" />
        Bảo mật dữ liệu và tuân thủ nguyên tắc an toàn
      </div>
    </aside>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.28Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.49l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.84a6.02 6.02 0 0 1 0-3.68V7.57H3.07a10 10 0 0 0 0 8.86l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.57l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"
      />
    </svg>
  );
}
