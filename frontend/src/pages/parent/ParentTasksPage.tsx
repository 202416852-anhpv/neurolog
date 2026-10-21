import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchChildren } from "@/api/child";
import { approveTask, createTask, fetchTasks } from "@/api/task";
import { fetchCurrentParent } from "@/lib/parent";
import type { Child } from "@/types/child";
import type { Task } from "@/types/task";

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
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Giao nhiệm vụ</h1>
        <p className="text-muted-foreground text-sm">
          Tạo việc nhà và theo dõi tiến độ hoàn thành của bé.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nhiệm vụ mới</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
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
              <Select
                value={assignId || undefined}
                onValueChange={setAssignId}
                disabled={children.length === 0}
              >
                <SelectTrigger id="task-child">
                  <SelectValue placeholder="Chưa có trẻ nào" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child._id} value={child._id}>
                      {child.name} ({child.age} tuổi)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={assigning || children.length === 0}
              className="w-full"
            >
              <Plus className="size-4" />
              {assigning ? "Đang giao..." : "Giao việc"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-4">
          <Card>
            <CardContent className="flex flex-col gap-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Label htmlFor="task-filter" className="shrink-0">
                Xem nhiệm vụ của
              </Label>
              <Select value={filterId} onValueChange={setFilterId}>
                <SelectTrigger id="task-filter" className="sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả các trẻ</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child._id} value={child._id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : visibleTasks.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                Chưa có nhiệm vụ nào đang làm
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleTasks.map((task) => (
                <Card key={task._id}>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                      <span className="flex-1 text-base font-semibold">
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
      </div>
    </div>
  );
}
