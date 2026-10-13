import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  createChild,
  deleteChild,
  fetchChildren,
  updateChild,
} from "@/api/child";
import type { Child, ChildInput } from "@/types/child";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Child | null>(null);
  const [deleting, setDeleting] = useState<Child | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchChildren()
      .then((data) => {
        if (!cancelled) setChildren(data);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được danh sách trẻ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback(
    async (input: ChildInput) => {
      if (editing) {
        const updated = await updateChild(editing._id, input);
        setChildren((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      } else {
        const created = await createChild(input);
        setChildren((prev) => [created, ...prev]);
      }
      setEditing(null);
    },
    [editing],
  );

  const handleDelete = useCallback(async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await deleteChild(deleting._id);
      setChildren((prev) => prev.filter((c) => c._id !== deleting._id));
      setDeleting(null);
    } catch {
      setError("Không xóa được, vui lòng thử lại");
    } finally {
      setDeletingBusy(false);
    }
  }, [deleting]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý trẻ</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormKey((k) => k + 1);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Thêm trẻ
        </Button>
      </div>

      {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : children.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          Chưa có trẻ nào, hãy thêm trẻ đầu tiên
        </p>
      ) : (
        <div className="grid gap-3">
          {children.map((child) => (
            <Card key={child._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="flex-1">
                    <Link
                      to={`/parent/children/${child._id}`}
                      className="hover:text-primary font-medium underline-offset-4 hover:underline"
                    >
                      {child.name}
                    </Link>
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      {child.age} tuổi
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(child);
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
                    onClick={() => setDeleting(child)}
                    aria-label={`Xóa ${child.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Xem nhiệm vụ, nhật ký và báo cáo của trẻ
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ChildFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={() => setDeleting(null)}
        title="Xóa trẻ?"
        description={
          deleting
            ? `Hồ sơ của ${deleting.name} và dữ liệu liên quan sẽ bị xóa. Hành động này không thể hoàn tác.`
            : ""
        }
        busy={deletingBusy}
        onConfirm={handleDelete}
      />
    </div>
  );
}
