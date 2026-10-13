import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createParent } from "@/api/parent";
import type { Parent } from "@/types/parent";

interface ParentSetupFormProps {
  onCreated: (parent: Parent) => void;
}

export default function ParentSetupForm({ onCreated }: ParentSetupFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const parsedAge = Number(age);
    if (!name.trim()) {
      setError("Vui lòng nhập tên của bạn");
      return;
    }
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 100) {
      setError("Tuổi phải là số nguyên từ 1 đến 100");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const parent = await createParent({
        name: name.trim(),
        age: parsedAge,
        email: email.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onCreated(parent);
    } catch {
      setError("Không lưu được, vui lòng thử lại");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center p-6">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-magenta/15">
          <HeartHandshake className="size-7 text-brand-magenta" />
        </span>
        <h1 className="text-2xl font-bold">Xin chào phụ huynh!</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hãy tạo hồ sơ của bạn để bắt đầu đồng hành cùng bé
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hồ sơ phụ huynh</CardTitle>
          <CardDescription>
            Thông tin này chỉ lưu trên hệ thống của gia đình bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="parent-name">Tên</Label>
            <Input
              id="parent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent-age">Tuổi</Label>
            <Input
              id="parent-age"
              type="number"
              min={1}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="VD: 35"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent-email">Email</Label>
            <Input
              id="parent-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
              maxLength={200}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent-phone">Số điện thoại (tuỳ chọn)</Label>
            <Input
              id="parent-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
              maxLength={20}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent-notes">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="parent-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Điều gì quan trọng với gia đình bạn?"
              maxLength={500}
              rows={3}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            className="h-12 w-full text-base"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu hồ sơ"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
