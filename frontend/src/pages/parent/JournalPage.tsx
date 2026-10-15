import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NotebookPen, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchChildren } from "@/api/child";
import { deleteJournal, fetchJournals } from "@/api/journal";
import { fetchCurrentParent } from "@/lib/parent";
import { cn } from "@/lib/utils";
import type { Child } from "@/types/child";
import {
  JOURNAL_TAG_META,
  JOURNAL_TAGS,
  UNRATED_ACCENT_CLASS,
  UNRATED_DOT_CLASS,
  type JournalEntry,
  type JournalTag,
} from "@/types/journal";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function TagDot({ tag }: { tag?: JournalTag }) {
  const label = tag ? JOURNAL_TAG_META[tag].label : "Chưa đánh giá";
  return (
    <span
      title={label}
      aria-label={`Đánh giá: ${label}`}
      className={cn(
        "inline-block size-3 shrink-0 rounded-full ring-2 ring-background",
        tag ? JOURNAL_TAG_META[tag].dotClass : UNRATED_DOT_CLASS,
      )}
    />
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filterChildId, setFilterChildId] = useState("all");
  const [filterTag, setFilterTag] = useState<"all" | JournalTag | "none">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCurrentParent(), fetchChildren()])
      .then(([parent, childData]) => {
        if (cancelled) return;
        const idSet = new Set(parent?.children ?? []);
        const linkedChildren = childData.filter((c) => idSet.has(c._id));
        setChildren(linkedChildren);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được dữ liệu, vui lòng thử lại");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetchJournals({
      childId: filterChildId !== "all" ? filterChildId : undefined,
      tag: filterTag !== "all" && filterTag !== "none" ? filterTag : undefined,
      from: from || undefined,
      to: to || undefined,
    })
      .then((data) => {
        if (cancelled) return;
        setError(null);
        setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được nhật ký");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, filterChildId, filterTag, from, to]);

  const linkedIdSet = useMemo(
    () => new Set(children.map((c) => c._id)),
    [children],
  );

  const childName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of children) map.set(c._id, c.name);
    return (id: string) => map.get(id) ?? "—";
  }, [children]);

  const visibleEntries = useMemo(() => {
    return entries.filter(
      (e) =>
        linkedIdSet.has(e.childId) &&
        (filterTag !== "none" || !e.tag),
    );
  }, [entries, linkedIdSet, filterTag]);

  const hasActiveFilters =
    filterChildId !== "all" || filterTag !== "all" || from !== "" || to !== "";

  const resetFilters = useCallback(() => {
    setFilterChildId("all");
    setFilterTag("all");
    setFrom("");
    setTo("");
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await deleteJournal(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch {
      setError("Không xóa được, vui lòng thử lại");
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Nhật ký tâm lý</h1>
          <p className="text-muted-foreground text-sm">
            Tổng hợp nhật ký theo mô hình ABC — Dẫn xuất · Hành vi · Hậu quả
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/parent/journal/new">
            <NotebookPen className="size-4" />
            Viết nhật ký
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-6 pb-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="f-child">Trẻ</Label>
            <select
              id="f-child"
              className={SELECT_CLASS}
              value={filterChildId}
              onChange={(e) => setFilterChildId(e.target.value)}
            >
              <option value="all">Tất cả các trẻ</option>
              {children.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="f-tag">Đánh giá</Label>
            <select
              id="f-tag"
              className={SELECT_CLASS}
              value={filterTag}
              onChange={(e) =>
                setFilterTag(e.target.value as "all" | JournalTag | "none")
              }
            >
              <option value="all">Tất cả đánh giá</option>
              {JOURNAL_TAGS.map((t) => (
                <option key={t} value={t}>
                  {JOURNAL_TAG_META[t].emoji} {JOURNAL_TAG_META[t].label}
                </option>
              ))}
              <option value="none">Chưa đánh giá</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="f-from">Từ ngày</Label>
            <Input
              id="f-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="f-to">Đến ngày</Label>
            <Input
              id="f-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={resetFilters}
              >
                <RotateCcw className="size-3.5" />
                Đặt lại bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result count */}
      {!loading && !error && (
        <p className="text-muted-foreground mb-3 text-sm">
          {visibleEntries.length} bản ghi
        </p>
      )}

      {error && <p className="text-destructive mb-3 text-sm">{error}</p>}

      {/* Entries list */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : visibleEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">
            {hasActiveFilters
              ? "Không có nhật ký nào khớp bộ lọc"
              : "Chưa có nhật ký nào"}
          </p>
          {!hasActiveFilters && (
            <Button asChild variant="outline" className="mt-4 gap-2">
              <Link to="/parent/journal/new">
                <NotebookPen className="size-4" />
                Viết nhật ký đầu tiên
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleEntries.map((entry) => (
            <Card
              key={entry._id}
              className={cn(
                "border-l-4",
                entry.tag
                  ? JOURNAL_TAG_META[entry.tag].accentClass
                  : UNRATED_ACCENT_CLASS,
                entry.tag ? JOURNAL_TAG_META[entry.tag].tintClass : undefined,
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                  <TagDot tag={entry.tag} />
                  <span className="text-muted-foreground font-normal">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-medium">
                    {childName(entry.childId)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(entry._id)}
                    disabled={deletingId === entry._id}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                {(
                  [
                    { label: "A", key: "antecedent" as const, color: "bg-brand-yellow" },
                    { label: "B", key: "behavior" as const, color: "bg-brand-magenta" },
                    { label: "C", key: "consequence" as const, color: "bg-brand-green" },
                  ]
                ).map(({ label, key, color }) => (
                  <div key={key} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${color}`}
                    >
                      {label}
                    </span>
                    <p className="text-foreground leading-relaxed">
                      {entry[key]}
                    </p>
                  </div>
                ))}
                {entry.notes && (
                  <div className="mt-1 rounded-lg bg-muted/50 p-3">
                    <p className="text-muted-foreground text-xs font-medium">
                      Ghi chú
                    </p>
                    <p className="mt-1 leading-relaxed">{entry.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
