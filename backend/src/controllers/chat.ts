import type { Request, Response } from "express";
import { chatRequestSchema } from "../validations/chat.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

const GREETINGS = [
  "Xin chào! Mình là trợ lý AI của NeuroLog. Bạn đang cần trao đổi điều gì về con yêu?",
  "Chào bạn! Hôm nay bạn muốn hỏi về hành vi, cảm xúc hay việc học của con?",
  "Hi! Mình sẵn sàng lắng nghe và gợi ý cho bạn trong việc đồng hành cùng con.",
];

const FALLBACKS = [
  "Bạn kể thêm chi tiết được không? Mình muốn hiểu tình huống rõ hơn để gợi ý phù hợp.",
  "Mình ghi nhận rồi. Bạn có thể mô tả thêm bối cảnh trước và sau khi việc đó xảy ra không?",
  "Cảm ơn bạn đã chia sẻ. Bạn thử ghi lại sự việc vào Nhật ký để theo dõi theo thời gian nhé.",
  "Đây là chủ đề nhiều gia đình cũng gặp. Bạn kể cụ thể hơn giúp mình nhé.",
  "Mình hiểu rồi. Nếu muốn, bạn có thể vào mục Nhật ký để ghi lại theo mô hình ABC nhé.",
];

const REPLIES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["chào", "hello", "xin chào", "chao"],
    reply: "Chào bạn! Rất vui được hỗ trợ. Bạn đang muốn trao đổi về điều gì?",
  },
  {
    keywords: ["nhiệm vụ", "giao việc", "việc"],
    reply:
      "Bạn vào mục Nhiệm vụ để giao việc cho con nhé. Khi con bấm Hoàn thành, bạn xác nhận để ghi nhận kết quả.",
  },
  {
    keywords: ["nhật ký", "abc", "tâm lý"],
    reply:
      "Nhật ký ABC giúp bạn nhìn ra Dẫn xuất — Hành vi — Hậu quả. Ghi đều đặn mỗi ngày sẽ giúp bạn thấy quy luật hành vi của con.",
  },
  {
    keywords: ["học", "toán", "chữ", "sách", "đọc"],
    reply:
      "Với việc học, hãy chia nhỏ nhiệm vụ và khen ngợi cụ thể khi con cố gắng. Bạn có thể tạo nhiệm vụ học tập cho con trong mục Nhiệm vụ.",
  },
  {
    keywords: ["buồn", "khóc", "giận", "bực", "cáu", "khó chịu"],
    reply:
      "Khi con đang xúc động mạnh, bạn hãy giữ bình tĩnh và đồng cảm trước, rồi mới đặt giới hạn. Ghi lại tình huống vào Nhật ký sẽ giúp bạn nhận ra dấu hiệu sớm hơn.",
  },
  {
    keywords: ["mệt", "căng thẳng", "stress", "mất ngủ", "ngủ"],
    reply:
      "Bạn cũng cần được nghỉ ngơi nữa. Với giấc ngủ của con, hãy cố định giờ đi ngủ và hạn chế màn hình trước giờ ngủ 30 phút.",
  },
  {
    keywords: ["ăn", "uống", "dinh dưỡng", "biếng ăn"],
    reply:
      "Về dinh dưỡng, hãy duy trì bữa ăn đều đặn và để con cùng chọn món lành mạnh. Nếu con biếng ăn kéo dài, bạn nên trao đổi thêm với bác sĩ nhi.",
  },
  {
    keywords: ["mẹ", "bố", "cha", "gia đình"],
    reply:
      "Gia đình là điểm tựa của con. Việc thống nhất cách nuôi dạy giữa các thành viên sẽ giúp con ổn định hơn.",
  },
  {
    keywords: ["cảm ơn", "thank"],
    reply: "Rất vui được giúp bạn! Lúc nào cần, bạn cứ nhắn nhé.",
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
  logger.info({ childId: parsed.data.childId }, "Chat reply sent");
  res.json({ reply });
};

export const greet = async (_req: Request, res: Response) => {
  const reply = GREETINGS[greetingIndex % GREETINGS.length] ?? GREETINGS[0]!;
  greetingIndex++;
  res.json({ reply });
};
