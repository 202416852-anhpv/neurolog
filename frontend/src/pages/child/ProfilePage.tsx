import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Save } from "lucide-react";
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
import { completeChildProfile } from "@/api/auth";
import { fetchChild, updateChild } from "@/api/child";
import { getStoredUserName } from "@/lib/auth";
import type { Child, ChildInput, Gender } from "@/types/child";

const PROFILE_ID_KEY = "neurolog.childId";

const SELECT_CLASS =
  "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const INPUT_CLASS = "h-12 text-base";

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "" as "" | Gender,
  dateOfBirth: "",
  weight: "",
  height: "",
  interests: "",
  healthNotes: "",
};

type FormState = typeof EMPTY_FORM;

const toFormState = (child: Child): FormState => ({
  name: child.name,
  age: String(child.age),
  gender: child.gender ?? "",
  dateOfBirth: child.dateOfBirth ? child.dateOfBirth.slice(0, 10) : "",
  weight: child.weight != null ? String(child.weight) : "",
  height: child.height != null ? String(child.height) : "",
  interests: child.interests ?? "",
  healthNotes: child.healthNotes ?? "",
});

interface ProfilePageProps {
  onProfiled?: (child: Child) => void;
}

export default function ProfilePage({ onProfiled }: ProfilePageProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...EMPTY_FORM,
    name: getStoredUserName() ?? "",
  }));
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const storedId = localStorage.getItem(PROFILE_ID_KEY);

    const load = storedId
      ? fetchChild(storedId)
          .then((child) => {
            if (cancelled) return;
            setProfileId(child._id);
            setForm(toFormState(child));
          })
          .catch(() => {
            if (cancelled) return;
            localStorage.removeItem(PROFILE_ID_KEY);
            setProfileId(null);
          })
      : Promise.resolve();

    load.finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const buildInput = useCallback((): ChildInput | null => {
    const name = form.name.trim();
    const age = Number(form.age);
    if (!name) {
      setError("Vui lòng nhập tên của bé");
      return null;
    }
    if (!Number.isInteger(age) || age < 1 || age > 18) {
      setError("Tuổi phải là số nguyên từ 1 đến 18");
      return null;
    }
    if (form.weight) {
      const weight = Number(form.weight);
      if (Number.isNaN(weight) || weight < 1 || weight > 300) {
        setError("Cân nặng phải từ 1 đến 300 kg");
        return null;
      }
    }
    if (form.height) {
      const height = Number(form.height);
      if (Number.isNaN(height) || height < 30 || height > 250) {
        setError("Chiều cao phải từ 30 đến 250 cm");
        return null;
      }
    }
    return {
      name,
      age,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      interests: form.interests.trim(),
      healthNotes: form.healthNotes.trim(),
    };
  }, [form]);

  const handleCopyId = async () => {
    if (!profileId) return;
    try {
      await navigator.clipboard.writeText(profileId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Không sao chép được, bé hãy sao chép thủ công nhé");
    }
  };

  const handleSave = async () => {
    const input = buildInput();
    if (!input) return;
    setSaving(true);
    setError(null);
    try {
      const child = profileId
        ? await updateChild(profileId, input)
        : (await completeChildProfile(input)).profile;
      localStorage.setItem(PROFILE_ID_KEY, child._id);
      setProfileId(child._id);
      setForm(toFormState(child));
      setSaved(true);
      onProfiled?.(child);
    } catch {
      setError("Không lưu được hồ sơ, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-xl font-bold">Hồ sơ của bé</h1>

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : (
        <>
          {error && <p className="text-destructive mb-4 text-sm">{error}</p>}
          {saved && (
            <p className="mb-4 text-sm text-green-600">
              Đã lưu hồ sơ thành công!
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {profileId ? "Thông tin của bé" : "Tạo hồ sơ mới"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileId && (
                <div className="mb-6 rounded-lg border border-dashed p-3">
                  <p className="text-muted-foreground mb-1 text-xs">
                    Mã hồ sơ
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs whitespace-nowrap">
                      {profileId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyId}
                      aria-label="Sao chép mã hồ sơ"
                    >
                      {copied ? (
                        <Check className="size-4 text-green-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {copied ? "Đã chép" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="profile-name">Tên</Label>
                  <Input
                    id="profile-name"
                    className={INPUT_CLASS}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Tên của bé"
                    maxLength={100}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-age">Tuổi</Label>
                  <Input
                    id="profile-age"
                    className={INPUT_CLASS}
                    type="number"
                    min={1}
                    max={18}
                    value={form.age}
                    onChange={(e) => setField("age", e.target.value)}
                    placeholder="1 - 18"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-gender">Giới tính</Label>
                  <select
                    id="profile-gender"
                    className={SELECT_CLASS}
                    value={form.gender}
                    onChange={(e) =>
                      setField("gender", e.target.value as "" | Gender)
                    }
                  >
                    <option value="">Chưa chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-dob">Ngày sinh</Label>
                  <Input
                    id="profile-dob"
                    className={INPUT_CLASS}
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setField("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-weight">Cân nặng (kg)</Label>
                  <Input
                    id="profile-weight"
                    className={INPUT_CLASS}
                    type="number"
                    min={1}
                    max={300}
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setField("weight", e.target.value)}
                    placeholder="VD: 25.5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-height">Chiều cao (cm)</Label>
                  <Input
                    id="profile-height"
                    className={INPUT_CLASS}
                    type="number"
                    min={30}
                    max={250}
                    step="0.1"
                    value={form.height}
                    onChange={(e) => setField("height", e.target.value)}
                    placeholder="VD: 95"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="profile-interests">
                    Sở thích / điểm mạnh
                  </Label>
                  <Textarea
                    id="profile-interests"
                    value={form.interests}
                    onChange={(e) => setField("interests", e.target.value)}
                    placeholder="Bé thích gì? Bé giỏi gì?"
                    maxLength={500}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="profile-health">
                    Dị ứng / ghi chú sức khỏe
                  </Label>
                  <Textarea
                    id="profile-health"
                    value={form.healthNotes}
                    onChange={(e) => setField("healthNotes", e.target.value)}
                    placeholder="Bé bị dị ứng gì? Có gì cần lưu ý không?"
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </div>

              <Button
                className="mt-6 h-12 w-full text-base"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="size-5" />
                {saving ? "Đang lưu..." : "Lưu hồ sơ"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
