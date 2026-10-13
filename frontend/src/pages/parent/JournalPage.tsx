import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  FileText,
  ImageIcon,
  Mic,
  MicOff,
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchChildren } from "@/api/child";
import { createJournal, deleteJournal, fetchJournals } from "@/api/journal";
import { fetchCurrentParent } from "@/lib/parent";
import type { Child } from "@/types/child";
import type { JournalEntry } from "@/types/journal";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ── Audio recorder (UI only) ─────────────────────────────── */

function AudioRecorderUI() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setHasRecording(false);
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsed > 0) setHasRecording(true);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) return;
    const audio = new Audio();
    audio.play().catch(() => {});
    setTimeout(() => setIsPlaying(false), elapsed * 1000);
  };

  const deleteRecording = () => {
    setHasRecording(false);
    setElapsed(0);
    setIsPlaying(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-magenta/10">
            <Mic className="size-4 text-brand-magenta" />
          </div>
          Ghi âm
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Tạm thời
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-6">
        {/* Waveform */}
        <div className="flex h-16 w-full items-end justify-center gap-[3px] rounded-lg bg-muted/50 px-4 py-3">
          {bars.map((i) => {
            const h = isRecording && !isPaused
              ? 12 + Math.abs(Math.sin(i * 0.7 + elapsed * 0.5)) * 36
              : hasRecording
                ? 8 + Math.abs(Math.sin(i * 0.5)) * 28
                : 4;
            return (
              <div
                key={i}
                className={`w-[5px] rounded-full transition-all duration-300 ${
                  isRecording && !isPaused
                    ? "bg-brand-magenta"
                    : hasRecording
                      ? "bg-brand-pink"
                      : "bg-muted-foreground/20"
                }`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        {/* Timer */}
        <p className="font-mono text-3xl font-bold tabular-nums tracking-tight">
          {formatDuration(elapsed)}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRecording && !hasRecording && (
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-brand-magenta p-0 text-white shadow-lg shadow-brand-magenta/30 hover:bg-brand-magenta/90"
              onClick={startRecording}
            >
              <Mic className="size-6" />
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full px-4"
                onClick={togglePause}
              >
                {isPaused ? "Tiếp tục" : "Tạm dừng"}
              </Button>
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-foreground p-0 text-white shadow-lg hover:bg-foreground/90"
                onClick={stopRecording}
              >
                <MicOff className="size-5" />
              </Button>
            </>
          )}

          {hasRecording && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full px-4"
                onClick={togglePlay}
              >
                <Play className="size-4" />
                {isPlaying ? "Đang phát..." : "Nghe lại"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-full px-4 text-destructive hover:bg-destructive/10"
                onClick={deleteRecording}
              >
                <Trash2 className="size-4" />
                Xóa
              </Button>
              <Button
                size="lg"
                className="h-11 rounded-full px-4 bg-brand-coral text-white hover:bg-brand-coral/90"
                onClick={startRecording}
              >
                <Mic className="size-4" />
                Ghi lại
              </Button>
            </>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-brand-magenta">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-magenta/50 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-magenta" />
            </span>
            Đang ghi âm...
          </div>
        )}
        {hasRecording && !isRecording && (
          <p className="text-muted-foreground text-xs">
            Bản ghi tạm thời — sẽ không lưu vào nhật ký
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Photo / OCR (UI only) ────────────────────────────────── */

function PhotoCaptureUI() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  const handleCapture = () => {
    // Mock: generate a placeholder "photo"
    setPhoto("mock");
    setOcrText("");
  };

  const handleUpload = () => {
    setPhoto("mock");
    setOcrText("");
  };

  const runOcr = () => {
    setIsOcrLoading(true);
    setTimeout(() => {
      setOcrText(
        "Đây là kết quả OCR mẫu.\nBé chơi puzzle 15 phút, sau đó vẽ tranh.\nTâm trạng vui, tập trung tốt.",
      );
      setIsOcrLoading(false);
    }, 2000);
  };

  const clearPhoto = () => {
    setPhoto(null);
    setOcrText("");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-mint/20">
            <Camera className="size-4 text-brand-mint" />
          </div>
          Chụp ảnh / OCR
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Tạm thời
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-6">
        {!photo ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/20 py-10">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="size-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Chụp ảnh hoặc tải lên để nhận diện chữ
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCapture} className="gap-2">
                <Camera className="size-4" />
                Chụp ảnh
              </Button>
              <Button variant="outline" onClick={handleUpload} className="gap-2">
                <Upload className="size-4" />
                Tải ảnh lên
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Mock photo preview */}
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-brand-mint/20 via-brand-pink/20 to-brand-magenta/10">
              <div className="flex h-44 items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="size-8" />
                  <p className="text-sm">Ảnh đã chụp (tạm thời)</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-7 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={clearPhoto}
              >
                <X className="size-3" />
              </Button>
            </div>

            {/* OCR */}
            {!ocrText ? (
              <Button
                variant="outline"
                onClick={runOcr}
                disabled={isOcrLoading}
                className="gap-2"
              >
                <FileText className="size-4" />
                {isOcrLoading ? "Đang nhận diện chữ..." : "Nhận diện chữ (OCR)"}
              </Button>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Kết quả OCR
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => setOcrText("")}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {ocrText}
                </p>
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Ảnh và kết quả OCR tạm thời — không lưu vào nhật ký
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Main page ────────────────────────────────────────────── */

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [antecedent, setAntecedent] = useState("");
  const [behavior, setBehavior] = useState("");
  const [consequence, setConsequence] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("all");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCurrentParent(), fetchJournals(), fetchChildren()])
      .then(([parent, journalData, childData]) => {
        if (cancelled) return;
        const idSet = new Set(parent?.children ?? []);
        const linkedChildren = childData.filter((c) => idSet.has(c._id));
        setChildren(linkedChildren);
        setEntries(journalData.filter((e) => idSet.has(e.childId)));
        if (linkedChildren.length > 0) setChildId(linkedChildren[0]._id);
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
  }, []);

  const childName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of children) map.set(c._id, c.name);
    return (id: string) => map.get(id) ?? "—";
  }, [children]);

  const visibleEntries = entries.filter(
    (e) => filterId === "all" || e.childId === filterId,
  );

  const handleSave = useCallback(async () => {
    if (!childId || !antecedent.trim() || !behavior.trim() || !consequence.trim()) {
      setError("Vui lòng điền đầy đủ A, B, C và chọn trẻ");
      return;
    }
    setSaving(true);
    try {
      const created = await createJournal({
        childId,
        date,
        antecedent: antecedent.trim(),
        behavior: behavior.trim(),
        consequence: consequence.trim(),
        notes: notes.trim(),
      });
      setEntries((prev) => [created, ...prev]);
      setAntecedent("");
      setBehavior("");
      setConsequence("");
      setNotes("");
      setError(null);
    } catch {
      setError("Không lưu được nhật ký, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  }, [childId, date, antecedent, behavior, consequence, notes]);

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

  const abcFields = [
    {
      key: "A" as const,
      label: "A — Dẫn xuất (Antecedent)",
      hint: "Điều gì xảy ra trước khi bé có hành vi?",
      placeholder:
        "VD: Bé đang chơi xếp hình, chị đến lấy mất khối lego...",
      value: antecedent,
      onChange: setAntecedent,
      color: "from-brand-yellow to-brand-coral",
      bg: "bg-brand-yellow/15",
      border: "border-brand-yellow/40 focus-visible:border-brand-yellow focus-visible:ring-brand-yellow/30",
    },
    {
      key: "B" as const,
      label: "B — Hành vi (Behavior)",
      hint: "Bé đã làm gì? Mô tả cụ thể, quan sát được.",
      placeholder:
        "VD: Bé hét lớn, đập tay xuống bàn, nói 'Không!'. Sau đó chạy ra góc phòng.",
      value: behavior,
      onChange: setBehavior,
      color: "from-brand-magenta to-brand-pink",
      bg: "bg-brand-magenta/10",
      border: "border-brand-magenta/30 focus-visible:border-brand-magenta focus-visible:ring-brand-magenta/30",
    },
    {
      key: "C" as const,
      label: "C — Hậu quả (Consequence)",
      hint: "Điều gì xảy ra sau đó? Phản ứng của bạn, kết quả...",
      placeholder:
        "VD: Mình ôm bé, đợi bé bình tĩnh. Sau 5 phút bé xin lỗi và chơi tiếp.",
      value: consequence,
      onChange: setConsequence,
      color: "from-brand-green to-brand-mint",
      bg: "bg-brand-green/10",
      border: "border-brand-green/30 focus-visible:border-brand-green focus-visible:ring-brand-green/30",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nhật ký tâm lý</h1>
        <p className="text-muted-foreground text-sm">
          Mô hình ABC — Dẫn xuất · Hành vi · Hậu quả
        </p>
      </div>

      {/* Audio + Photo side by side */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <AudioRecorderUI />
        <PhotoCaptureUI />
      </div>

      {/* ABC Form */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-yellow/20">
              <Plus className="size-4 text-brand-coral" />
            </div>
            Viết nhật ký
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="j-child">Trẻ</Label>
              <select
                id="j-child"
                className={SELECT_CLASS}
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
              >
                {children.length === 0 && <option value="">Chưa có trẻ</option>}
                {children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.age} tuổi)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="j-date">Ngày</Label>
              <Input
                id="j-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {abcFields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label
                htmlFor={`j-${field.key.toLowerCase()}`}
                className="flex items-center gap-2"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${field.color}`}
                >
                  {field.key}
                </span>
                {field.label.slice(4)}
              </Label>
              <p className="text-muted-foreground -mt-1 text-xs">
                {field.hint}
              </p>
              <Textarea
                id={`j-${field.key.toLowerCase()}`}
                variant="abc"
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className={field.border}
              />
            </div>
          ))}

          <div className="grid gap-2">
            <Label htmlFor="j-notes">Ghi chú thêm (tùy chọn)</Label>
            <Textarea
              id="j-notes"
              placeholder="Cảm nhận, yếu tố liên quan, thuốc, giấc ngủ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            onClick={handleSave}
            disabled={saving || children.length === 0}
            className="h-11 gap-2 text-base"
          >
            <Save className="size-4" />
            {saving ? "Đang lưu..." : "Lưu nhật ký"}
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="mb-3 grid gap-2">
        <Label htmlFor="j-filter">Xem nhật ký của</Label>
        <select
          id="j-filter"
          className={SELECT_CLASS}
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
        >
          <option value="all">Tất cả các trẻ</option>
          {children.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Entries list */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : visibleEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Chưa có nhật ký nào
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleEntries.map((entry) => (
            <Card key={entry._id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
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
