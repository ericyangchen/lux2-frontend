export interface TelegramGroup {
  id: string;
  telegramChatId: string;
  organizationId: string;
  status: "active" | "inactive";
  chatInfo: {
    title?: string;
    type: string;
    memberCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}
