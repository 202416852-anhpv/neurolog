import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  error?: string | null;
  onSubmit: (childId: string) => Promise<void>;
}

export default function LinkChildDialog({
  open,
  onOpenChange,
  busy = false,
  error = null,
  onSubmit,
}: LinkChildDialogProps) {
  const [childId, setChildId] = useState("");

  const handleSubmit = async () => {
    const trimmed = childId.trim();
    if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      return;
    }
    await onSubmit(trimmed);
    setChildId("");
  };

  const valid = /^[0-9a-fA-F]{24}$/.test(childId.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          onOpenChange(next);
          if (!next) setChildId("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liên kết trẻ có sẵn</DialogTitle>
          <DialogDescription>
            Dán mã hồ sơ của bé — bé xem mã này ở trang Hồ sơ trong Góc của bé.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="link-child-id">Mã hồ sơ của bé</Label>
          <Input
            id="link-child-id"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            placeholder="Dán mã hồ sơ của bé"
            className="font-mono"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!valid || busy}>
            <Link2 className="size-4" />
            {busy ? "Đang liên kết..." : "Liên kết"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
