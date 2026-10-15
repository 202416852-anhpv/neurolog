import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  ClipboardCheck,
  Eye,
  Hourglass,
  ListChecks,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchChild } from "@/api/child";
import { fetchTasks } from "@/api/task";
import type { Child } from "@/types/child";
import type { Task } from "@/types/task";

const PROFILE_ID_KEY = "neurolog.childId";

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const PET_MOODS = [
  { emoji: "🐣", mood: "Bé chưa có nhiệm vụ nào, mình ngồi đợi bé nè!" },
  { emoji: "😺", mood: "Có việc rồi! Bé làm xong mình sẽ vui hơn nữa!" },
  { emoji: "🥰", mood: "Bé làm xong việc rồi, mình hạnh phúc quá!" },
  { emoji: "🤩", mood: "Bé tuyệt vời lắm! Cả nhiệm vụ nào cũng xong hết!" },
];

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function ChildPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const storedId = localStorage.getItem(PROFILE_ID_KEY);
    const load = storedId
      ? fetchChild(storedId)
          .then((data) => {
            if (cancelled) return;
            setChild(data);
            return fetchTasks(data._id).then((taskList) => {
              if (!cancelled) setTasks(taskList);
            });
          })
          .catch(() => {
            if (cancelled) return;
            localStorage.removeItem(PROFILE_ID_KEY);
            setError("Không mở được hồ sơ, bé hãy tạo lại nhé");
          })
      : Promise.resolve();
    load.finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-2 text-xl font-bold">Góc của bé</h1>
        {error && <p className="text-destructive mb-4 text-sm">{error}</p>}
        <p className="text-muted-foreground mb-4 text-sm">
          Bé chưa có hồ sơ. Vào "Hồ sơ" để điền thông tin và làm quen với căn
          phòng của mình nhé!
        </p>
        <Button className="h-12 text-base" asChild>
          <Link to="/child/profile">
            <UserPlus className="size-5" />
            Tạo hồ sơ ngay
          </Link>
        </Button>
      </div>
    );
  }

  const pending = tasks.filter((task) => task.status === "pending");
  const submitted = tasks.filter((task) => task.status === "submitted");
  const done = tasks.filter((task) => task.status === "done");
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((done.length / total) * 100);
  const petIndex = total === 0 ? 0 : done.length === 0 ? 1 : pending.length + submitted.length === 0 ? 3 : 2;
  const pet = PET_MOODS[petIndex] ?? PET_MOODS[0]!;
  const infoBits = [
    `${child.age} tuổi`,
    child.gender ? GENDER_LABEL[child.gender] : null,
    child.weight != null ? `${child.weight} kg` : null,
    child.height != null ? `${child.height} cm` : null,
  ].filter(Boolean);
  const previewTasks = pending.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-brand-magenta text-3xl font-bold text-white">
          {child.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {greetingByHour()}, {child.name}!
          </h1>
          <p className="text-muted-foreground text-sm">
            {infoBits.join(" · ")}
          </p>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Sparkles className="size-5 text-brand-yellow" />
              Hôm nay bé thế nào?
            </CardTitle>
            <CardDescription>
              {total === 0
                ? "Chưa có nhiệm vụ nào, vào xem nhiệm vụ nhé!"
                : `Bé đã hoàn thành ${done.length}/${total} nhiệm vụ`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-coral transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-brand-coral/10 p-3">
                <p className="text-2xl font-bold text-brand-coral">
                  {pending.length}
                </p>
                <p className="text-muted-foreground text-xs">Còn lại</p>
              </div>
              <div className="rounded-xl bg-brand-yellow/15 p-3">
                <p className="text-2xl font-bold text-brand-coral">
                  {submitted.length}
                </p>
                <p className="text-muted-foreground text-xs">Chờ duyệt</p>
              </div>
              <div className="rounded-xl bg-brand-green/10 p-3">
                <p className="text-2xl font-bold text-brand-green">
                  {done.length}
                </p>
                <p className="text-muted-foreground text-xs">Đã xong</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Thú cưng</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 text-center">
            <span className="text-6xl">{pet.emoji}</span>
            <p className="text-sm">{pet.mood}</p>
            <p className="text-muted-foreground text-xs">
              Hoàn thành nhiệm vụ để thú cưng vui hơn nhé!
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <ListChecks className="size-5 text-brand-coral" />
                Nhiệm vụ sắp làm
              </CardTitle>
              <CardDescription>
                {previewTasks.length > 0
                  ? "Bé làm xong rồi bấm Hoàn thành nhé"
                  : "Không còn việc đang dang dở"}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/child/tasks">
                Xem tất cả
                <Hourglass className="size-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {previewTasks.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm">
              {total === 0
                ? "Chưa có nhiệm vụ nào, chờ phụ huynh giao việc nhé"
                : "Giỏi lắm, bé đã làm xong hết nhiệm vụ!"}
            </p>
          ) : (
            <ul className="grid gap-2">
              {previewTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                >
                  <span className="flex-1">{task.title}</span>
                  <Badge variant="secondary">Chưa làm</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button className="h-12 text-base" asChild>
          <Link to="/child/tasks">
            <ListChecks className="size-5" />
            Nhiệm vụ
          </Link>
        </Button>
        <Button variant="outline" className="h-12 text-base" asChild>
          <Link to="/child/profile">
            <Eye className="size-5" />
            Hồ sơ
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-12 text-base"
          asChild
        >
          <Link to="/child/chat">
            <Bot className="size-5" />
            Trò chuyện AI
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-brand-mint/40 bg-brand-mint/10 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-mint text-white">
          <ClipboardCheck className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold">Mẹo cho bé hôm nay</p>
          <p className="text-muted-foreground text-sm">
            Học xong nhớ nghỉ ngơi và uống nước đủ nha. Bé cũng có thể trò
            chuyện với bạn AI khi thấy buồn hoặc vui!
          </p>
        </div>
      </div>
    </div>
  );
}
