import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { fetchChildren } from "@/api/child";
import { fetchTasks, submitTask } from "@/api/task";
import type { Child } from "@/types/child";
import type { Task } from "@/types/task";

const SELECT_CLASS =
  "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default function TasksPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksFor, setTasksFor] = useState("");
  const [loadingKids, setLoadingKids] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchChildren()
      .then((data) => {
        if (cancelled) return;
        setChildren(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được danh sách");
      })
      .finally(() => {
        if (!cancelled) setLoadingKids(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    fetchTasks(selectedId)
      .then((data) => {
        if (cancelled) return;
        setTasks(data.filter((task) => task.status !== "done"));
        setTasksFor(selectedId);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Không tải được nhiệm vụ");
        setTasksFor(selectedId);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const loadingTasks = selectedId !== "" && tasksFor !== selectedId;

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

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-xl font-bold">Nhiệm vụ của bé</h1>

      <div className="mb-4 grid gap-2">
        <Label htmlFor="kid-pick">Bạn là ai?</Label>
        <select
          id="kid-pick"
          className={SELECT_CLASS}
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setTasks([]);
          }}
          disabled={loadingKids}
        >
          {children.map((child) => (
            <option key={child._id} value={child._id}>
              {child.name} ({child.age} tuổi)
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

      {loadingKids || loadingTasks ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          {children.length === 0
            ? "Chưa có bạn nào, nhờ phụ huynh thêm nhé"
            : "Tuyệt vời, bé đã xong hết việc!"}
        </p>
      ) : (
        <div className="grid gap-3">
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
