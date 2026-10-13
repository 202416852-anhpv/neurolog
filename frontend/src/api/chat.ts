import api from "./client";

export interface ChatReply {
  reply: string;
}

export const sendChatMessage = async (
  message: string,
  childId?: string,
): Promise<ChatReply> => {
  const { data } = await api.post<ChatReply>("/chat", { message, childId });
  return data;
};

export const fetchGreeting = async (): Promise<ChatReply> => {
  const { data } = await api.get<ChatReply>("/chat/greet");
  return data;
};
