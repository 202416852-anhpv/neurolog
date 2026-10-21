import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  CheckCheck,
  ListChecks,
  Loader2,
  Mic,
  NotebookPen,
  ScanLine,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchChildren } from "@/api/child";
import { approveTask, fetchTasks } from "@/api/task";
import { fetchJournals } from "@/api/journal";
import { fetchCurrentParent } from "@/lib/parent";
import type { Child } from "@/types/child";
import type { Parent } from "@/types/parent";
import type { Task } from "@/types/task";
import type { JournalEntry } from "@/types/journal";

const AVATAR_COLORS = [
  "bg-brand-magenta",
  "bg-brand-green",
  "bg-brand-yellow",
  "bg-brand-mint",
  "bg-brand-coral",
  "bg-brand-pink",
];

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function isWithinDays(iso: string, days: number): boolean {
  const t = new Date(iso).getTime();
  return t >= Date.now() - days * 24 * 60 * 60 * 1000;
}

/* ── Stat card ─────────────────────────────────────────────── */

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tint: string;
  iconColor: string;
  sub?: string;
}

function StatCard({ icon, label, value, tint, iconColor, sub }: StatCardProps) {
  return (
    <Card className="gap-0 py-4 md:gap-3 md:py-5">
      <CardContent className="flex items-center gap-3 px-4 md:gap-4 md:px-5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl md:size-12 md:rounded-2xl ${tint}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-extrabold tabular-nums md:text-2xl">
            {value}
          </p>
          <p className="text-muted-foreground text-xs md:text-sm">{label}</p>
          {sub && (
            <p className="text-muted-foreground/80 mt-0.5 text-[10px] leading-tight md:text-xs">
              {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Weekly chart ──────────────────────────────────────────── */

function WeeklyChart({ tasks }: { tasks: Task[] }) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = tasks.filter((t) => {
        const updated = new Date(t.updatedAt).getTime();
        return t.status === "done" && updated >= d.getTime() && updated < next.getTime();
      }).length;
      return { label: DAY_LABELS[d.getDay()], count, isToday: i === 6 };
    });
  }, [tasks]);

  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <Card className="h-full w-full gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-green/10">
            <Sparkles className="size-4 text-brand-green" />
          </div>
          Hoạt động 7 ngày qua
        </CardTitle>
        <CardDescription>
          Số nhiệm vụ bé đã hoàn thành mỗi ngày
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-end">
        <div className="flex h-36 w-full items-end justify-between gap-2">
          {days.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`text-xs font-bold tabular-nums ${d.count === 0 ? "text-muted-foreground/50" : ""}`}
              >
                {d.count}
              </span>
              <div className="flex h-24 w-full items-end justify-center">
                {d.count > 0 && (
                  <div
                    className={`w-full max-w-8 rounded-t-md transition-all duration-500 ${
                      d.isToday
                        ? "bg-brand-magenta shadow-lg shadow-brand-magenta/20"
                        : "bg-brand-magenta/40"
                    }`}
                    style={{
                      height: `${Math.max(12, (d.count / max) * 100)}%`,
                    }}
                  />
                )}
              </div>
              <span
                className={`text-xs ${d.isToday ? "font-bold text-brand-green" : "text-muted-foreground"}`}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main page ─────────────────────────────────────────────── */

export default function ParentPage() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchCurrentParent(),
      fetchChildren(),
      fetchTasks(),
      fetchJournals(),
    ])
      .then(([parentData, childData, taskData, journalData]) => {
        if (cancelled) return;
        const idSet = new Set(parentData?.children ?? []);
        setParent(parentData);
        setChildren(childData.filter((c) => idSet.has(c._id)));
        setTasks(taskData.filter((t) => idSet.has(t.childId)));
        setJournals(journalData.filter((j) => idSet.has(j.childId)));
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được dữ liệu tổng quan");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const childName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of children) map.set(c._id, c.name);
    return (id: string) => map.get(id) ?? "—";
  }, [children]);

  const childAvatar = useMemo(() => {
    const map = new Map<string, string>();
    children.forEach((c, i) => map.set(c._id, AVATAR_COLORS[i % AVATAR_COLORS.length]));
    return (id: string) => map.get(id) ?? "bg-brand-magenta";
  }, [children]);

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const submitted = tasks.filter((t) => t.status === "submitted").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const weekJournals = journals.filter((j) => isWithinDays(j.createdAt, 7)).length;
    return { pending, submitted, done, weekJournals };
  }, [tasks, journals]);

  const submittedTasks = useMemo(
    () => tasks.filter((t) => t.status === "submitted").slice(0, 5),
    [tasks],
  );

  const childProgress = useMemo(() => {
    return children.map((child) => {
      const own = tasks.filter((t) => t.childId === child._id);
      const done = own.filter((t) => t.status === "done").length;
      const active = own.filter((t) => t.status !== "done").length;
      const pct = own.length === 0 ? 0 : Math.round((done / own.length) * 100);
      return { child, total: own.length, done, active, pct };
    });
  }, [children, tasks]);

  const recentJournals = useMemo(
    () =>
      [...journals]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [journals],
  );

  const handleApprove = useCallback(async (id: string) => {
    setApprovingId(id);
    try {
      await approveTask(id);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "done" as const } : t)),
      );
    } catch {
      setError("Không xác nhận được, vui lòng thử lại");
    } finally {
      setApprovingId(null);
    }
  }, []);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#004AC6] p-6 text-white shadow-lg md:p-8">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
              <CalendarDays className="size-4" />
              {today}
            </p>
            <h1 className="text-2xl font-extrabold md:text-3xl">
              {greetingByHour()}{parent ? `, ${parent.name}` : ", gia đình"}! 💖
            </h1>
            <p className="mt-1 max-w-md text-sm text-white/85">
              Hôm nay có{" "}
              <span className="font-bold">{stats.submitted}</span> nhiệm vụ chờ
              xác nhận và{" "}
              <span className="font-bold">{stats.weekJournals}</span> nhật ký trong
              tuần. Cùng đồng hành với bé nhé!
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="lg"
              className="bg-white/95 text-primary shadow-sm hover:bg-white"
            >
              <Link to="/parent/tasks">
                <ListChecks className="size-4" />
                Giao việc
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/parent/journal">
                <NotebookPen className="size-4" />
                Nhật ký
              </Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-4 -bottom-14 size-32 rounded-full bg-white/10" />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Users className="size-5" />}
              label="Số trẻ"
              value={children.length}
              tint="bg-brand-mint/15"
              iconColor="text-brand-mint"
            />
            <StatCard
              icon={<CheckCheck className="size-5" />}
              label="Chờ xác nhận"
              value={stats.submitted}
              tint="bg-brand-coral/15"
              iconColor="text-brand-coral"
              sub="Bé đã nộp, chờ bạn duyệt"
            />
            <StatCard
              icon={<ListChecks className="size-5" />}
              label="Đang thực hiện"
              value={stats.pending}
              tint="bg-brand-yellow/20"
              iconColor="text-brand-coral"
            />
            <StatCard
              icon={<BookOpenText className="size-5" />}
              label="Nhật ký tuần này"
              value={stats.weekJournals}
              tint="bg-brand-magenta/10"
              iconColor="text-brand-green"
            />
          </div>

          {/* Quick actions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Ghi chép nhanh</h2>
              <span className="text-primary flex items-center gap-1 text-xs font-semibold">
                <Sparkles className="size-3.5" />
                AI Trợ lý
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Link
                to="/parent/journal/new"
                className="bg-gradient-to-r from-primary-container to-primary flex items-center gap-3 rounded-2xl p-4 text-white shadow-sm transition hover:opacity-95"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Mic className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    Ghi âm ABC
                  </span>
                  <span className="block text-xs text-white/75">
                    Giọng nói AI
                  </span>
                </span>
              </Link>
              <Link
                to="/parent/journal/new"
                className="bg-card hover:border-primary/30 flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition"
              >
                <span className="bg-secondary-container/60 text-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <ScanLine className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    Quét sổ tay
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    Chụp ảnh OCR
                  </span>
                </span>
              </Link>
              <Link
                to="/parent/journal/new"
                className="bg-secondary hover:border-primary/30 flex items-center gap-3 rounded-2xl border-2 border-primary/20 p-4 transition"
              >
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <NotebookPen className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    Ghi chú
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    Quan sát trong ngày
                  </span>
                </span>
              </Link>
              <Link
                to="/parent/chat"
                className="bg-card hover:border-primary/30 flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition"
              >
                <span className="bg-brand-yellow/20 text-brand-coral flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Sparkles className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    Hỏi AI
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    Tư vấn nhanh
                  </span>
                </span>
              </Link>
            </div>
          </div>

          {/* Chart + Waiting approval */}
          <div className="grid items-stretch gap-4 lg:grid-cols-5">
            <div className="flex lg:col-span-3">
              <WeeklyChart tasks={tasks} />
            </div>

            <Card className="flex flex-col lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex size-8 items-center justify-center rounded-full bg-brand-coral/15">
                    <CheckCheck className="size-4 text-brand-coral" />
                  </div>
                  Chờ xác nhận
                  {submittedTasks.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-brand-coral/15 text-brand-coral"
                    >
                      {submittedTasks.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Duyệt để ghi nhận bé hoàn thành
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-2">
                {submittedTasks.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                    <CheckCheck className="text-brand-green mx-auto mb-2 size-8" />
                    <p className="text-sm font-medium">Đã duyệt hết!</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Không có nhiệm vụ nào chờ xác nhận
                    </p>
                  </div>
                ) : (
                  <ul className="grid gap-2">
                    {submittedTasks.map((task) => (
                      <li
                        key={task._id}
                        className="flex items-center gap-3 rounded-lg border bg-background p-3"
                      >
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${childAvatar(task.childId)}`}
                        >
                          {childName(task.childId).charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {task.title}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {childName(task.childId)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0 bg-brand-green text-white hover:bg-brand-green/90"
                          disabled={approvingId === task._id}
                          onClick={() => handleApprove(task._id)}
                        >
                          {approvingId === task._id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Duyệt
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  asChild
                  variant="ghost"
                  className="text-muted-foreground mt-auto w-full hover:text-brand-green"
                >
                  <Link to="/parent/tasks">
                    Xem tất cả nhiệm vụ
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Children progress */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex size-8 items-center justify-center rounded-full bg-brand-mint/20">
                      <Users className="size-4 text-brand-mint" />
                    </div>
                    Tiến độ của bé
                  </CardTitle>
                  <CardDescription>
                    Tỷ lệ nhiệm vụ hoàn thành theo từng bé
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/parent/children">
                    Quản lý trẻ
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {childProgress.length === 0 ? (
                <div className="rounded-xl border border-dashed py-10 text-center">
                  <Users className="text-muted-foreground mx-auto mb-2 size-8" />
                  <p className="text-sm font-medium">Chưa có bé nào</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Thêm bé để bắt đầu theo dõi tiến độ
                  </p>
                  <Button asChild className="mt-4 bg-brand-magenta hover:bg-brand-magenta/90">
                    <Link to="/parent/children">Thêm bé đầu tiên</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {childProgress.map(({ child, total, done, pct }) => (
                    <Link
                      key={child._id}
                      to={`/parent/children/${child._id}`}
                      className="group rounded-xl border p-4 transition-all hover:border-brand-magenta/40 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${childAvatar(child._id)}`}
                        >
                          {child.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold group-hover:text-brand-green">
                            {child.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {child.age} tuổi · {done}/{total} nhiệm vụ
                          </p>
                        </div>
                        <span className="text-sm font-extrabold tabular-nums text-brand-green">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-coral transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent journals */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex size-8 items-center justify-center rounded-full bg-brand-yellow/20">
                      <NotebookPen className="size-4 text-brand-coral" />
                    </div>
                    Nhật ký gần đây
                  </CardTitle>
                  <CardDescription>
                    Những quan sát tâm lý mới nhất của bé
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/parent/journal">
                    Xem nhật ký
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {recentJournals.length === 0 ? (
                <div className="rounded-xl border border-dashed py-10 text-center">
                  <NotebookPen className="text-muted-foreground mx-auto mb-2 size-8" />
                  <p className="text-sm font-medium">Chưa có nhật ký nào</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Ghi lại hành vi của bé theo mô hình ABC để theo dõi tâm lý
                  </p>
                  <Button asChild className="mt-4 bg-brand-magenta hover:bg-brand-magenta/90">
                    <Link to="/parent/journal/new">Viết nhật ký đầu tiên</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {recentJournals.map((entry) => (
                    <Link
                      key={entry._id}
                      to="/parent/journal"
                      className="group rounded-xl border p-4 transition-all hover:border-brand-magenta/40 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${childAvatar(entry.childId)}`}
                        >
                          {childName(entry.childId).charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold">
                          {childName(entry.childId)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          · {formatDate(entry.date)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px]"
                        >
                          ABC
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                        {entry.behavior}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-[10px] font-bold text-brand-coral">
                          A
                        </span>
                        <span className="rounded-full bg-brand-magenta/10 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                          B
                        </span>
                        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                          C
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Motivational footer banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-yellow text-foreground">
                <Star className="size-5 fill-current" />
              </span>
              <div>
                <p className="font-bold">Mỗi ngày một chút, bé lớn khôn từng giờ</p>
                <p className="text-muted-foreground text-sm">
                  Duy trì ghi nhật ký đều đặn để nắm bắt tâm lý bé tốt hơn.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="bg-brand-coral text-white hover:bg-brand-coral/90"
            >
              <Link to="/parent/journal/new">
                <NotebookPen className="size-4" />
                Ghi nhật ký hôm nay
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
