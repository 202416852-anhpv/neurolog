import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchChild } from "@/api/child";
import { fetchTasks, submitTask } from "@/api/task";
import type { Child } from "@/types/child";
import type { Task } from "@/types/task";

const PROFILE_ID_KEY = "neurolog.childId";

export default function TasksPage() {
  const [child, setChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const storedId = localStorage.getItem(PROFILE_ID_KEY);
    const load = storedId
      ? fetchChild(storedId)
          .then((data) => {
            if (cancelled) return;
            setChild(data);
            return fetchTasks(data._id).then((taskList) => {
              if (!cancelled) {
                setTasks(taskList.filter((task) => task.status !== "done"));
              }
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

  const handleSubmit = async (id: string) => {
    setSubmittingId(id);
    try {
      const updated = await submitTask(id);
      setTasks((prev) => prev.map((task) => (task._id === id ? updated : task)));
    } catch {
      setError("Không gửi được, vui lòng thử lại");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6 lg:px-6 lg:py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6 lg:py-8">
        <h1 className="mb-4 text-xl font-bold">Nhiệm vụ của bé</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <p className="text-muted-foreground mb-4 text-sm">
          Bé chưa có hồ sơ. Vào "Hồ sơ" để điền thông tin trước đã nhé!
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6 lg:py-8">
      <h1 className="mb-1 text-xl font-bold">Nhiệm vụ của {child.name}</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Hoàn thành xong nhớ bấm "Hoàn thành" để phụ huynh duyệt nhé!
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          Tuyệt vời, bé đã xong hết việc!
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tasks.map((task) => (
            <Card key={task._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex-1 text-lg font-medium">
                    {task.title}
                  </span>
                  {task.status === "submitted" && <Badge>Chờ duyệt</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {task.status === "pending" ? (
                  <Button
                    className="h-12 w-full text-base"
                    onClick={() => handleSubmit(task._id)}
                    disabled={submittingId === task._id}
                  >
                    <Check className="size-5" />
                    {submittingId === task._id ? "Đang gửi..." : "Hoàn thành"}
                  </Button>
                ) : (
                  <p className="text-muted-foreground text-center text-sm">
                    Đã gửi, chờ phụ huynh xác nhận nhé
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
