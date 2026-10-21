import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenText, Link2, ListChecks, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ChildFormDialog from "@/components/children/ChildFormDialog";
import LinkChildDialog from "@/components/parent/LinkChildDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { createChild, fetchChildren } from "@/api/child";
import { fetchTasks } from "@/api/task";
import { fetchJournals } from "@/api/journal";
import { linkChild } from "@/api/parent";
import { fetchCurrentParent, getStoredParentId } from "@/lib/parent";
import type { Child, ChildInput } from "@/types/child";
import type { Task } from "@/types/task";
import type { JournalEntry } from "@/types/journal";

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const AVATAR_COLORS = [
  "bg-brand-magenta",
  "bg-brand-green",
  "bg-brand-yellow",
  "bg-brand-mint",
  "bg-brand-coral",
  "bg-brand-pink",
];

interface ChildSummary {
  child: Child;
  totalTasks: number;
  doneTasks: number;
  journalCount: number;
}

const buildSummaries = (
  linked: Child[],
  tasks: Task[],
  journals: JournalEntry[],
): ChildSummary[] =>
  linked.map((child) => {
    const ownTasks = tasks.filter((t) => t.childId === child._id);
    return {
      child,
      totalTasks: ownTasks.length,
      doneTasks: ownTasks.filter((t) => t.status === "done").length,
      journalCount: journals.filter((j) => j.childId === child._id).length,
    };
  });

export default function ChildrenPage() {
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [parent, allChildren, tasks, journals] = await Promise.all([
      fetchCurrentParent(),
      fetchChildren(),
      fetchTasks(),
      fetchJournals(),
    ]);
    const idSet = new Set(parent?.children ?? []);
    return buildSummaries(
      allChildren.filter((c) => idSet.has(c._id)),
      tasks,
      journals,
    );
  }, []);

  const reload = useCallback(async () => {
    setSummaries(await loadData());
  }, [loadData]);

  useEffect(() => {
    let cancelled = false;
    loadData()
      .then((data) => {
        if (!cancelled) setSummaries(data);
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
  }, [loadData]);

  const handleCreate = useCallback(
    async (input: ChildInput) => {
      const created = await createChild(input);
      const storedParentId = getStoredParentId();
      if (storedParentId) {
        try {
          await linkChild(storedParentId, created._id);
        } catch {
          setError(
            "Đã tạo trẻ nhưng không liên kết được, hãy dán mã hồ sơ thủ công",
          );
        }
      }
      await reload();
    },
    [reload],
  );

  const handleLink = useCallback(
    async (childId: string) => {
      const storedParentId = getStoredParentId();
      if (!storedParentId) return;
      setLinkBusy(true);
      setLinkError(null);
      try {
        await linkChild(storedParentId, childId);
        await reload();
        setLinkOpen(false);
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        setLinkError(
          status === 404
            ? "Không tìm thấy trẻ với mã này"
            : "Không liên kết được, vui lòng thử lại",
        );
      } finally {
        setLinkBusy(false);
      }
    },
    [reload],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Quản lý trẻ</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setLinkError(null);
              setLinkOpen(true);
            }}
          >
            <Link2 className="size-4" />
            Liên kết bé có sẵn
          </Button>
          <Button
            onClick={() => {
              setFormKey((k) => k + 1);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Thêm trẻ
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : summaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center">
          <p className="font-medium">Chưa liên kết bé nào</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Bé tạo hồ sơ ở Góc của bé rồi dán mã hồ sơ vào đây, hoặc
            bấm "Thêm trẻ" để tạo mới
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaries.map(({ child, totalTasks, doneTasks, journalCount }, i) => (
            <Link
              key={child._id}
              to={`/parent/children/${child._id}`}
              className={`group rounded-xl border bg-card p-4 shadow-xs transition-all hover:border-brand-magenta/40 hover:shadow-md ${
                summaries.length === 1
                  ? "flex flex-wrap items-center justify-between gap-4"
                  : ""
              }`}
            >
              <div
                className={`flex items-center gap-3 ${
                  summaries.length === 1 ? "" : "mb-3"
                }`}
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  }`}
                >
                  {child.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-brand-green">
                    {child.name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {child.age} tuổi
                    {child.gender ? ` · ${GENDER_LABEL[child.gender]}` : ""}
                    {child.weight != null ? ` · ${child.weight} kg` : ""}
                    {child.height != null ? ` · ${child.height} cm` : ""}
                  </p>
                </div>
              </div>
              <div
                className={`flex text-sm ${
                  summaries.length === 1 ? "gap-6" : "gap-4"
                }`}
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ListChecks className="size-4" />
                  <span className="font-semibold text-foreground">
                    {doneTasks}/{totalTasks}
                  </span>
                  nhiệm vụ
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpenText className="size-4" />
                  <span className="font-semibold text-foreground">
                    {journalCount}
                  </span>
                  nhật ký
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ChildFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={null}
        onSubmit={handleCreate}
      />

      <LinkChildDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        busy={linkBusy}
        error={linkError}
        onSubmit={handleLink}
      />
    </div>
  );
}
