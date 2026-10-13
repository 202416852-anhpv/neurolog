import type { Request, Response } from "express";
import { chatRequestSchema } from "../validations/chat.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

const GREETINGS = [
  "Chào bé! Mình là bạn AI của bé nè. Bé muốn trò chuyện gì nào? 😊",
  "Xin chào bé yêu! Hôm nay bé thấy vui không?",
  "Hi bé! Mình ở đây rồi, bé cứ chuyện gì cứ kể mình nghe nhé!",
];

const FALLBACKS = [
  "Bé kể thêm cho mình nghe được không? Mình muốn hiểu bé nhiều hơn!",
  "Mình nghe rồi đấy! Bé có muốn kể một điều vui nào của hôm nay không?",
  "Hay quá! Bé làm tốt lắm, cứ tiếp tục chia sẻ với mình nhé!",
  "Mình ghi nhận rồi nè. Bé có muốn mình kể một câu chuyện thú vị không?",
  "Bé nói hay lắm! Mỗi ngày một chút, bé sẽ tiến bộ hơn mỗi ngày đó!",
];

const REPLIES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["chào", "hello", "xin chào", "chao"],
    reply: "Chào bé! Rất vui được gặp bé. Hôm nay bé muốn làm gì nào?",
  },
  {
    keywords: ["nhiệm vụ", "việc", "bài"],
    reply:
      "Bé vào tab Nhiệm vụ để xem việc cần làm nhé. Hoàn thành xong nhớ bấm Hoàn thành để phụ huynh duyệt nha!",
  },
  {
    keywords: ["học", "toán", "chữ", "sách", "đọc"],
    reply: "Học hành chăm chỉ là giỏi lắm đó! Bé đang học môn gì thú vị nhất?",
  },
  {
    keywords: ["vui", "hạnh phúc", "yêu đời"],
    reply: "Nghe vậy mình cũng vui lây! Bé chia sẻ thêm điều gì làm bé vui nha!",
  },
  {
    keywords: ["buồn", "khóc", "tệ", "khó chịu", "bực"],
    reply: "Mình hiểu bé đang buồn rồi. Bé cứ từ từ kể cho mình nghe, mình luôn ở đây bên bé nhé. Bé cũng có thể kể cho phụ huynh hoặc ghi vào nhật ký nữa.",
  },
  {
    keywords: ["mẹ", "bố", "cha", "phụ huynh"],
    reply: "Phụ huynh luôn yêu bé nhiều lắm đấy! Bé muốn kể cho mình nghe về gia đình không?",
  },
  {
    keywords: ["pet", "thú cưng", "động vật", "chó", "mèo"],
    reply: "Thú cưng dễ thương ghê! Bé nuôi pet trong Góc của bé rồi chứ? Chăm pet tốt thì pet sẽ vui lắm đó!",
  },
  {
    keywords: ["ngủ", "giấc ngủ", "mệt"],
    reply: "Ngủ đủ giấc giúp bé khỏe mạnh và học giỏi hơn đó. Bé nên đi ngủ sớm nha!",
  },
  {
    keywords: ["cảm ơn", "thank"],
    reply: "Bé khách sáo gì đâu! Lúc nào muốn trò chuyện mình cũng sẵn sàng nha!",
  },
];

let fallbackIndex = 0;
let greetingIndex = 0;

const pickReply = (message: string): string => {
  const normalized = message.toLowerCase();
  for (const rule of REPLIES) {
    if (rule.keywords.some((k) => normalized.includes(k))) {
      return rule.reply;
    }
  }
  const reply = FALLBACKS[fallbackIndex % FALLBACKS.length] ?? FALLBACKS[0]!;
  fallbackIndex++;
  return reply;
};

export const chat = async (req: Request, res: Response) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const reply = pickReply(parsed.data.message);
  logger.info({ childId: parsed.data.childId }, "Mock chat reply sent");
  res.json({ reply });
};

export const greet = async (_req: Request, res: Response) => {
  const reply = GREETINGS[greetingIndex % GREETINGS.length] ?? GREETINGS[0]!;
  greetingIndex++;
  res.json({ reply });
};
