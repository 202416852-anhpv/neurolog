import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  FileText,
  ImageIcon,
  Mic,
  MicOff,
  Play,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { createJournal } from "@/api/journal";
import { fetchCurrentParent } from "@/lib/parent";
import { cn } from "@/lib/utils";
import type { Child } from "@/types/child";
import {
  JOURNAL_TAG_META,
  JOURNAL_TAGS,
  type JournalTag,
} from "@/types/journal";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Audio recorder ───────────────────────────────────────── */

function AudioRecorderUI() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const bars = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch {
      setError(
        "Không truy cập được micro. Bạn kiểm tra quyền truy cập micro của trình duyệt nhé.",
      );
    }
  };

  const stopRecording = () => {
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };

  const togglePause = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
      stopTimer();
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setError("Không phát lại được bản ghi âm"));
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
    setElapsed(0);
    setIsPlaying(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-magenta/10">
            <Mic className="size-4 text-brand-green" />
          </div>
          Ghi âm
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-6">
        {/* Waveform */}
        <div className="flex h-16 w-full items-end justify-center gap-[3px] rounded-lg bg-muted/50 px-4 py-3">
          {bars.map((i) => {
            const h = isRecording && !isPaused
              ? 12 + Math.abs(Math.sin(i * 0.7 + elapsed * 0.5)) * 36
              : audioUrl
                ? 8 + Math.abs(Math.sin(i * 0.5)) * 28
                : 4;
            return (
              <div
                key={i}
                className={`w-[5px] rounded-full transition-all duration-300 ${
                  isRecording && !isPaused
                    ? "bg-brand-magenta"
                    : audioUrl
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
          {!isRecording && !audioUrl && (
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

          {audioUrl && (
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
          <div className="flex items-center gap-2 text-sm text-brand-green">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-magenta/50 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-magenta" />
            </span>
            Đang ghi âm...
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </CardContent>
    </Card>
  );
}

/* ── Photo / OCR ──────────────────────────────────────────── */

function PhotoCaptureUI() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const captureInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<File | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    fileRef.current = file;
    setPhoto(url);
    setOcrText("");
    setOcrProgress(0);
    setError(null);
  };

  const runOcr = async () => {
    const file = fileRef.current;
    if (!file) return;
    setIsOcrLoading(true);
    setOcrProgress(0);
    setError(null);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("vie", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      try {
        const { data } = await worker.recognize(file);
        setOcrText(data.text.trim());
      } finally {
        await worker.terminate();
      }
    } catch {
      setError(
        "Không nhận diện được chữ từ ảnh. Bạn thử lại với ảnh rõ nét hơn nhé.",
      );
    } finally {
      setIsOcrLoading(false);
    }
  };

  const clearPhoto = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    fileRef.current = null;
    setPhoto(null);
    setOcrText("");
    setOcrProgress(0);
    setError(null);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-mint/20">
            <Camera className="size-4 text-brand-mint" />
          </div>
          Chụp ảnh / OCR
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
              <Button
                className="gap-2"
                onClick={() => captureInputRef.current?.click()}
              >
                <Camera className="size-4" />
                Chụp ảnh
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => uploadInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Tải ảnh lên
              </Button>
            </div>
            <input
              ref={captureInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-lg border">
              <img
                src={photo}
                alt="Ảnh đã chụp"
                className="h-44 w-full object-cover"
              />
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
                {isOcrLoading
                  ? `Đang nhận diện chữ... ${ocrProgress}%`
                  : "Nhận diện chữ (OCR)"}
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
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}

/* ── Main page ────────────────────────────────────────────── */

export default function JournalWritePage() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [antecedent, setAntecedent] = useState("");
  const [behavior, setBehavior] = useState("");
  const [consequence, setConsequence] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState<JournalTag | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCurrentParent(), fetchChildren()])
      .then(([parent, childData]) => {
        if (cancelled) return;
        const idSet = new Set(parent?.children ?? []);
        const linkedChildren = childData.filter((c) => idSet.has(c._id));
        setChildren(linkedChildren);
        if (linkedChildren.length > 0) setChildId(linkedChildren[0]._id);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được dữ liệu, vui lòng thử lại");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (
      !childId ||
      !tag ||
      !antecedent.trim() ||
      !behavior.trim() ||
      !consequence.trim()
    ) {
      setError("Vui lòng điền đầy đủ A, B, C, chọn trẻ và đánh giá ngày hôm nay");
      return;
    }
    setSaving(true);
    try {
      await createJournal({
        childId,
        date,
        antecedent: antecedent.trim(),
        behavior: behavior.trim(),
        consequence: consequence.trim(),
        notes: notes.trim(),
        tag,
      });
      navigate("/parent/journal", { replace: true });
    } catch {
      setError("Không lưu được nhật ký, vui lòng thử lại");
      setSaving(false);
    }
  }, [childId, date, antecedent, behavior, consequence, notes, tag, navigate]);

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
      border: "border-brand-green/30 focus-visible:border-brand-green focus-visible:ring-brand-green/30",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => navigate("/parent/journal")}
            aria-label="Quay lại nhật ký"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Viết nhật ký</h1>
            <p className="text-muted-foreground text-sm">
              Mô hình ABC — Dẫn xuất · Hành vi · Hậu quả
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/parent/journal")}
        >
          Xem nhật ký
        </Button>
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
              <Save className="size-4 text-brand-coral" />
            </div>
            Ghi chú sự kiện
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

          {/* Tag rating */}
          <div className="grid gap-2">
            <Label id="j-tag-label">Đánh giá ngày hôm nay</Label>
            <div
              role="radiogroup"
              aria-labelledby="j-tag-label"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {JOURNAL_TAGS.map((value) => {
                const meta = JOURNAL_TAG_META[value];
                const selected = tag === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTag(value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors outline-none",
                      "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      selected
                        ? meta.optionClass
                        : "border-input bg-transparent hover:bg-accent/50",
                    )}
                  >
                    <span aria-hidden>{meta.emoji}</span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {abcFields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label
                htmlFor={`j-${field.key.toLowerCase()}`}
                className="flex items-center gap-2"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-foreground ${field.color}`}
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
            disabled={saving || loading || children.length === 0}
            className="h-11 gap-2 text-base"
          >
            <Save className="size-4" />
            {saving ? "Đang lưu..." : "Lưu nhật ký"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
