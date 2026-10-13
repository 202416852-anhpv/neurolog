import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ClipboardCopy, Hourglass, Link2, ListChecks, Pencil, Trash2, Unlink, Loader2, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ChildFormDialog from "@/components/children/ChildFormDialog";
import ConfirmDeleteDialog from "@/components/children/ConfirmDeleteDialog";
import {
  deleteChild,
  fetchChild,
  updateChild,
} from "@/api/child";
import { fetchTasks } from "@/api/task";
import { fetchJournals } from "@/api/journal";
import { unlinkChild } from "@/api/parent";
import { getStoredParentId } from "@/lib/parent";
import type { Child, ChildInput } from "@/types/child";
import type { Task } from "@/types/task";
import type { JournalEntry } from "@/types/journal";

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const TASK_STATUS_BADGE: Record<Task["status"], string> = {
  pending: "Chưa làm",
  submitted: "Chờ duyệt",
  done: "Đã xong",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN");

export default function ChildDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    Promise.all([fetchChild(id), fetchTasks(id), fetchJournals(id)])
      .then(([childData, taskList, journalList]) => {
        if (cancelled) return;
        setChild(childData);
        setTasks(taskList);
        setJournals(journalList);
      })
      .catch(() => {
        if (!cancelled) setError("Không tìm thấy trẻ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = useCallback(
    async (input: ChildInput) => {
      if (!id) return;
      const updated = await updateChild(id, input);
      setChild(updated);
    },
    [id],
  );

  const handleCopyId = async () => {
    if (!child) return;
    try {
      await navigator.clipboard.writeText(child._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Không sao chép được mã, bé hãy sao chép thủ công");
    }
  };

  const handleUnlink = useCallback(async () => {
    if (!child) return;
    const storedParentId = getStoredParentId();
    if (!storedParentId) return;
    setUnlinking(true);
    try {
      await unlinkChild(storedParentId, child._id);
      navigate("/parent/children");
    } catch {
      setError("Không gỡ liên kết được, vui lòng thử lại");
      setUnlinking(false);
    }
  }, [child, navigate]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    setDeletingBusy(true);
    try {
      await deleteChild(id);
      navigate("/parent/children");
    } catch {
      setError("Không xóa được, vui lòng thử lại");
      setConfirmDelete(false);
    } finally {
      setDeletingBusy(false);
    }
  }, [id, navigate]);

  if (!id) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-destructive mb-4 text-sm">Thiếu mã của trẻ</p>
        <Button variant="outline" asChild>
          <Link to="/parent/children">
            <ArrowLeft className="size-4" />
            Về danh sách
          </Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-destructive mb-4 text-sm">
          {error ?? "Không tìm thấy trẻ"}
        </p>
        <Button variant="outline" asChild>
          <Link to="/parent/children">
            <ArrowLeft className="size-4" />
            Về danh sách
          </Link>
        </Button>
      </div>
    );
  }

  const pending = tasks.filter((task) => task.status === "pending").length;
  const submitted = tasks.filter((task) => task.status === "submitted").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const recentJournals = journals.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/parent/children">
          <ArrowLeft className="size-4" />
          Danh sách trẻ
        </Link>
      </Button>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex-1">{child.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFormKey((k) => k + 1);
                setFormOpen(true);
              }}
              aria-label={`Sửa ${child.name}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUnlink}
              disabled={unlinking}
              aria-label={`Gỡ liên kết ${child.name}`}
            >
              {unlinking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unlink className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Xóa ${child.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Tuổi: </span>
            {child.age}
          </p>
          <p>
            <span className="text-muted-foreground">Giới tính: </span>
            {child.gender ? GENDER_LABEL[child.gender] : "Chưa cập nhật"}
          </p>
          <p>
            <span className="text-muted-foreground">Ngày sinh: </span>
            {child.dateOfBirth ? formatDate(child.dateOfBirth) : "Chưa cập nhật"}
          </p>
          <p>
            <span className="text-muted-foreground">Cân nặng: </span>
            {child.weight != null ? `${child.weight} kg` : "Chưa cập nhật"}
          </p>
          <p>
            <span className="text-muted-foreground">Chiều cao: </span>
            {child.height != null ? `${child.height} cm` : "Chưa cập nhật"}
          </p>
          {child.interests && (
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Sở thích / điểm mạnh: </span>
              {child.interests}
            </p>
          )}
          {child.healthNotes && (
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">
                Dị ứng / ghi chú sức khỏe:{" "}
              </span>
              {child.healthNotes}
            </p>
          )}
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Mã hồ sơ (ObjectId): </span>
            <span className="mt-1 flex items-center gap-2">
              <code className="overflow-x-auto rounded bg-muted px-2 py-1 text-xs whitespace-nowrap">
                {child._id}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyId}
                aria-label="Sao chép mã hồ sơ"
              >
                {copied ? (
                  <Check className="size-3.5 text-green-600" />
                ) : (
                  <ClipboardCopy className="size-3.5" />
                )}
                {copied ? "Đã chép" : "Copy"}
              </Button>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Link2 className="size-3" />
                Bé xem mã này ở Góc của bé → Hồ sơ
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ListChecks className="size-5 text-brand-coral" />
              Chưa làm
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{pending}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Hourglass className="size-5 text-brand-yellow" />
              Chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{submitted}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ClipboardCheck className="size-5 text-brand-green" />
              Đã xong
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{done}</CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Nhiệm vụ</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có nhiệm vụ nào
            </p>
          ) : (
            <div className="grid gap-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 rounded-md border p-3 text-sm"
                >
                  <span className="flex-1">{task.title}</span>
                  <Badge variant={task.status === "done" ? "default" : "secondary"}>
                    {TASK_STATUS_BADGE[task.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nhật ký tâm lý gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJournals.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Chưa có nhật ký nào
            </p>
          ) : (
            <div className="grid gap-3">
              {recentJournals.map((entry) => (
                <div key={entry._id} className="rounded-md border p-3 text-sm">
                  <p className="mb-2 font-medium">{formatDate(entry.date)}</p>
                  <div className="grid gap-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">A - </span>
                      {entry.antecedent}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">B - </span>
                      {entry.behavior}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">C - </span>
                      {entry.consequence}
                    </p>
                    {entry.notes && (
                      <p>
                        <span className="font-medium text-foreground">
                          Ghi chú:{" "}
                        </span>
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ChildFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={child}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xóa trẻ?"
        description={`Hồ sơ của ${child.name} và dữ liệu liên quan sẽ bị xóa. Hành động này không thể hoàn tác.`}
        busy={deletingBusy}
        onConfirm={handleDelete}
      />
    </div>
  );
}
