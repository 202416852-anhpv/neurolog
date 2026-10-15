import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchChildren } from "@/api/child";
import { approveTask, createTask, fetchTasks } from "@/api/task";
import { fetchCurrentParent } from "@/lib/parent";
import type { Child } from "@/types/child";
import type { Task } from "@/types/task";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm";

export default function ParentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [title, setTitle] = useState("");
  const [assignId, setAssignId] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCurrentParent(), fetchTasks(), fetchChildren()])
      .then(([parent, taskData, childData]) => {
        if (cancelled) return;
        const idSet = new Set(parent?.children ?? []);
        const linkedChildren = childData.filter((c) => idSet.has(c._id));
        setChildren(linkedChildren);
        setTasks(taskData.filter((t) => idSet.has(t.childId)));
        if (linkedChildren.length > 0) setAssignId(linkedChildren[0]._id);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được nhiệm vụ");
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
    for (const child of children) map.set(child._id, child.name);
    return (id: string) => map.get(id) ?? "—";
  }, [children]);

  const visibleTasks = tasks.filter(
    (task) =>
      task.status !== "done" &&
      (filterId === "all" || task.childId === filterId),
  );

  const handleAssign = useCallback(async () => {
    if (!title.trim() || !assignId) {
      setError("Vui lòng nhập nhiệm vụ và chọn trẻ");
      return;
    }
    setAssigning(true);
    try {
      const created = await createTask({
        title: title.trim(),
        childId: assignId,
      });
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      setError(null);
    } catch {
      setError("Không giao được nhiệm vụ, vui lòng thử lại");
    } finally {
      setAssigning(false);
    }
  }, [title, assignId]);

  const handleApprove = useCallback(async (id: string) => {
    setApprovingId(id);
    try {
      await approveTask(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch {
      setError("Không xác nhận được, vui lòng thử lại");
    } finally {
      setApprovingId(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Giao nhiệm vụ</h1>

      <Card className="mb-4">
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Nhiệm vụ</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Dọn góc học tập"
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleAssign()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-child">Giao cho trẻ</Label>
            <select
              id="task-child"
              className={SELECT_CLASS}
              value={assignId}
              onChange={(e) => setAssignId(e.target.value)}
            >
              {children.length === 0 && (
                <option value="">Chưa có trẻ nào</option>
              )}
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.name} ({child.age} tuổi)
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={assigning || children.length === 0}
          >
            <Plus className="size-4" />
            {assigning ? "Đang giao..." : "Giao việc"}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-3 grid gap-2">
        <Label htmlFor="task-filter">Xem nhiệm vụ của</Label>
        <select
          id="task-filter"
          className={SELECT_CLASS}
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
        >
          <option value="all">Tất cả các trẻ</option>
          {children.map((child) => (
            <option key={child._id} value={child._id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : visibleTasks.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          Chưa có nhiệm vụ nào đang làm
        </p>
      ) : (
        <div className="grid gap-3">
          {visibleTasks.map((task) => (
            <Card key={task._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex-1 text-base font-medium">
                    {task.title}
                  </span>
                  {task.status === "submitted" ? (
                    <Badge>Chờ duyệt</Badge>
                  ) : (
                    <Badge variant="secondary">Chưa làm</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">
                  {childName(task.childId)}
                </p>
                {task.status === "submitted" && (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(task._id)}
                    disabled={approvingId === task._id}
                  >
                    <Check className="size-4" />
                    {approvingId === task._id ? "Đang duyệt..." : "Xác nhận"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
