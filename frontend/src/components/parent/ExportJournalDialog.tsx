import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStoredUserName } from "@/lib/auth";
import type { Child } from "@/types/child";
import {
  JOURNAL_TAGS,
  JOURNAL_TAG_META,
  type JournalEntry,
  type JournalTag,
} from "@/types/journal";

type TagFilter = "all" | JournalTag | "none";

interface ExportJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: Child;
  entries: JournalEntry[];
}

export default function ExportJournalDialog({
  open,
  onOpenChange,
  child,
  entries,
}: ExportJournalDialogProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tagFilter, setTagFilter] = useState<TagFilter>("all");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidRange = Boolean(from && to && from > to);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const day = entry.date.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (tagFilter === "none") return !entry.tag;
      if (tagFilter !== "all" && entry.tag !== tagFilter) return false;
      return true;
    });
  }, [entries, from, tagFilter, to]);

  const tagLabel =
    tagFilter === "all"
      ? "Tất cả đánh giá"
      : tagFilter === "none"
        ? "Chưa đánh giá"
        : JOURNAL_TAG_META[tagFilter].label;

  const resetFilters = () => {
    setFrom("");
    setTo("");
    setTagFilter("all");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && exporting) return;
    if (!nextOpen) resetFilters();
    onOpenChange(nextOpen);
  };

  const handleExport = async () => {
    if (invalidRange || filteredEntries.length === 0 || exporting) return;
    setExporting(true);
    setError(null);
    try {
      const { downloadJournalReport } = await import("@/lib/journalReport");
      await downloadJournalReport({
        child,
        entries: filteredEntries,
        from: from || undefined,
        to: to || undefined,
        tagLabel,
        parentName: getStoredUserName() || undefined,
      });
      resetFilters();
      onOpenChange(false);
    } catch {
      setError("Không tạo được PDF. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xuất báo cáo PDF</DialogTitle>
          <DialogDescription>
            Chọn phạm vi nhật ký của {child.name}. Báo cáo gồm toàn bộ bản ghi
            phù hợp, không chỉ 5 mục gần đây.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="export-from">Từ ngày</Label>
              <Input
                id="export-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="export-to">Đến ngày</Label>
              <Input
                id="export-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="export-tag">Đánh giá</Label>
            <Select
              value={tagFilter}
              onValueChange={(value) => setTagFilter(value as TagFilter)}
            >
              <SelectTrigger id="export-tag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đánh giá</SelectItem>
                {JOURNAL_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {JOURNAL_TAG_META[tag].label}
                  </SelectItem>
                ))}
                <SelectItem value="none">Chưa đánh giá</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            className="bg-muted/50 rounded-xl px-3 py-2 text-sm"
            aria-live="polite"
          >
            {invalidRange ? (
              <span className="text-destructive">
                Khoảng ngày không hợp lệ. Vui lòng chọn lại.
              </span>
            ) : filteredEntries.length === 0 ? (
              <span className="text-muted-foreground">
                Không có bản ghi phù hợp để xuất.
              </span>
            ) : (
              <span>
                Sẽ xuất <strong>{filteredEntries.length}</strong> bản ghi của{" "}
                <strong>{child.name}</strong>.
              </span>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={exporting}
          >
            Hủy
          </Button>
          <Button
            className="gap-2"
            onClick={handleExport}
            disabled={
              exporting || invalidRange || filteredEntries.length === 0
            }
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {exporting ? "Đang tạo PDF..." : "Xuất PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
