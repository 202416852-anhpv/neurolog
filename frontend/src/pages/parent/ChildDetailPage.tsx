import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
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
import type { Child, ChildInput } from "@/types/child";

export default function ChildDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingBusy, setDeletingBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    fetchChild(id)
      .then((data) => {
        if (!cancelled) setChild(data);
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
      <div className="mx-auto max-w-5xl p-6">
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
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="mx-auto max-w-5xl p-6">
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

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/parent/children">
          <ArrowLeft className="size-4" />
          Danh sách trẻ
        </Link>
      </Button>

      <Card>
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
              onClick={() => setConfirmDelete(true)}
              aria-label={`Xóa ${child.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>
            <span className="text-muted-foreground">Tuổi: </span>
            {child.age}
          </p>
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
