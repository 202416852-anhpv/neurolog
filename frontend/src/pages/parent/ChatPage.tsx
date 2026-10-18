import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchGreeting, sendChatMessage } from "@/api/chat";

export type ChatMessage = {
  id: number;
  role: "user" | "ai";
  text: string;
};

let messageId = 0;

export default function ParentChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGreeting()
      .then((res) => {
        setMessages([
          {
            id: messageId++,
            role: "ai",
            text: res.reply,
          },
        ]);
      })
      .catch(() => {
        setMessages([
          {
            id: messageId++,
            role: "ai",
            text: "Xin chào! Mình là trợ lý AI. Bạn cần mình hỗ trợ gì vậy nhỉ?",
          },
        ]);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: messageId++,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await sendChatMessage(text);
      const aiMessage: ChatMessage = {
        id: messageId++,
        role: "ai",
        text: res.reply,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Mình đang bận chút, bạn gửi lại nhé!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col gap-4 px-4 py-4 md:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Trợ lý AI</h1>
        <p className="text-muted-foreground text-sm">
          Hỏi đáp nhanh cùng trợ lý AI để được hỗ trợ trong công việc chăm sóc trẻ
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
              <Bot className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Trợ lý AI</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-brand-green text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted flex items-center gap-2 rounded-2xl px-4 py-2 text-sm shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang nghĩ...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi..."
                maxLength={1000}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Gửi</span>
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">Tối đa 1000 ký tự</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
