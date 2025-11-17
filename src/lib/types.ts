export type EmailCategory = "important" | "marketing";

export interface EmailRecord {
  id: string;
  sender: string;
  subject: string;
  body: string;
  receivedAt: string;
  category?: EmailCategory;
  importanceScore?: number;
  unsubscribeLink?: string;
  replyDraft?: string;
  status?: "pending" | "processed";
  autoAction?: "reply" | "unsubscribe" | null;
}

export interface AgentOptions {
  formalToneLevel?: "balanced" | "very_formal";
  unsubscribeAggressiveness?: "conservative" | "balanced" | "aggressive";
}

