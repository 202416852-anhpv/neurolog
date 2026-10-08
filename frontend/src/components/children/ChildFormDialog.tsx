import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Child, ChildInput } from "@/types/child";

interface ChildFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Child | null;
  onSubmit: (input: ChildInput) => Promise<void>;
}

export default function ChildFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: ChildFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const parsedAge = Number(age);
    if (!name.trim()) {
      setError("Vui lòng nhập tên của trẻ");
      return;
    }
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 18) {
      setError("Tuổi phải là số nguyên từ 1 đến 18");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        age: parsedAge,
      });
      onOpenChange(false);
    } catch {
      setError("Không lưu được, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? "Sửa thông tin trẻ" : "Thêm trẻ"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="child-name">Tên</Label>
            <Input
              id="child-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của trẻ"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="child-age">Tuổi</Label>
            <Input
              id="child-age"
              type="number"
              min={1}
              max={18}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="1 - 18"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
