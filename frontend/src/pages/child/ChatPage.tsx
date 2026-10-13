import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchGreeting, sendChatMessage } from "@/api/chat";

const PROFILE_ID_KEY = "neurolog.childId";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

let messageId = 0;
const nextId = () => `msg-${++messageId}`;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGreeting()
      .then((data) => {
        if (!cancelled) {
          setMessages([{ id: nextId(), role: "ai", text: data.reply }]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([
            {
              id: nextId(),
              role: "ai",
              text: "Chào bé! Mình sẵn sàng trò chuyện rồi nè!",
            },
          ]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    setSending(true);
    try {
      const childId = localStorage.getItem(PROFILE_ID_KEY) ?? undefined;
      const data = await sendChatMessage(text, childId);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "ai", text: data.reply },
      ]);
    } catch {
      setError("Mình đang ngủ quên mất, bé gửi lại nhé!");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col p-6">
      <h1 className="mb-4 text-xl font-bold">Trò chuyện cùng AI</h1>

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-mint/30 text-lg">
              🤖
            </span>
            Bạn AI của bé
            <span className="text-muted-foreground ml-auto text-xs font-normal">
              (bản thử — luôn trả lời mẫu)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-sm bg-brand-magenta text-white"
                    : "rounded-bl-sm bg-muted"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Đang nghĩ...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}

      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nói gì với bạn AI nào..."
          maxLength={1000}
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()}>
          <Send className="size-4" />
          Gửi
        </Button>
      </div>
    </div>
  );
}
