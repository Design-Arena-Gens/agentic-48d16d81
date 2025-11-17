import { AgentOptions, EmailCategory, EmailRecord } from "./types";

const marketingIndicators = [
  "unsubscribe",
  "sale",
  "deal",
  "promo",
  "limited time",
  "newsletter",
  "exclusive offer",
  "discount",
  "marketing",
  "growth hacker",
  "🔥",
  "🚀",
  "🌟",
];

const importantIndicators = [
  "urgent",
  "quarterly",
  "meeting",
  "review",
  "compliance",
  "due diligence",
  "contract",
  "invoice",
  "documentation",
  "funding",
  "deadline",
];

const formalityOpenings: Record<NonNullable<AgentOptions["formalToneLevel"]>, string> = {
  balanced: "Hello",
  very_formal: "Dear",
};

const formalityClosings: Record<NonNullable<AgentOptions["formalToneLevel"]>, string> = {
  balanced: "Best regards",
  very_formal: "Respectfully",
};

function containsKeyword(source: string, keywords: string[]): boolean {
  const haystack = source.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function estimateCategory(email: EmailRecord): EmailCategory {
  const base = `${email.subject} ${email.body}`.toLowerCase();
  if (containsKeyword(base, marketingIndicators)) {
    return "marketing";
  }
  if (containsKeyword(base, importantIndicators)) {
    return "important";
  }
  return email.sender.endsWith(".org") || email.sender.includes("board") ? "important" : "marketing";
}

function computeImportanceScore(email: EmailRecord, category: EmailCategory): number {
  if (category === "marketing") {
    return 5;
  }
  let score = 65;
  if (containsKeyword(email.subject, ["urgent", "due diligence", "compliance"])) {
    score += 20;
  }
  if (containsKeyword(email.body, ["deadline", "Friday", "documentation"])) {
    score += 10;
  }
  if (email.body.length > 500) {
    score += 5;
  }
  return Math.min(100, score);
}

function buildReply(email: EmailRecord, options: AgentOptions): string {
  const tone = options.formalToneLevel ?? "balanced";
  const greetingName = email.sender.split("@")[0].split(".")[0];
  const opening = formalityOpenings[tone];
  const closing = formalityClosings[tone];
  const dueDateSnippet = extractDueDateHint(email.body);
  const askSnippet = extractAsk(email.body);

  return [
    `${opening} ${capitaliseWord(greetingName)},`,
    "",
    `Thank you for the update regarding "${email.subject.trim()}".`,
    askSnippet ? askSnippet : "I appreciate the detailed guidance you provided.",
    dueDateSnippet
      ? `I will deliver the requested materials by ${dueDateSnippet} and keep you updated on any progress.`
      : "I will follow through promptly and confirm once everything is completed.",
    "",
    `${closing},`,
    "Alex",
  ].join("\n");
}

function extractAsk(body: string): string | null {
  const sentences = body.split(/\.\s+|\n/).map((line) => line.trim());
  const actionable = sentences.find((sentence) =>
    /(submit|send|share|provide|schedule|propose|complete|deliver|attach)/i.test(sentence),
  );
  return actionable ? `I will ${rewriteAsFirstPerson(actionable)}.` : null;
}

function extractDueDateHint(body: string): string | null {
  const dateMatch = body.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[\w\s,]*/i);
  if (dateMatch) {
    return dateMatch[0].replace(/\.$/, "").trim();
  }
  const explicit = body.match(/\b(March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i);
  if (explicit) {
    return explicit[0];
  }
  const relative = body.match(/\b(next week|tomorrow|by \w+\s*\d{0,2}|within \d{1,2} days)\b/i);
  return relative ? relative[0] : null;
}

function rewriteAsFirstPerson(sentence: string): string {
  const cleaned = sentence.replace(/please\s*/i, "");
  return cleaned
    .replace(/submit/i, "submit")
    .replace(/provide/i, "provide")
    .replace(/share/i, "share")
    .replace(/send/i, "send")
    .replace(/schedule/i, "schedule")
    .replace(/propose/i, "propose")
    .replace(/complete/i, "complete")
    .replace(/deliver/i, "deliver")
    .replace(/attach/i, "attach");
}

function capitaliseWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export interface AgentSummary {
  importantCount: number;
  marketingCount: number;
  autoReplies: number;
  autoUnsubscribes: number;
  pending: number;
}

export interface ProcessResult {
  emails: EmailRecord[];
  summary: AgentSummary;
}

export function processInbox(
  inbox: EmailRecord[],
  options: AgentOptions = { formalToneLevel: "balanced", unsubscribeAggressiveness: "balanced" },
): ProcessResult {
  const processed = inbox.map((email) => {
    const category = estimateCategory(email);
    const importanceScore = computeImportanceScore(email, category);
    const next: EmailRecord = {
      ...email,
      category,
      importanceScore,
      status: "processed",
      autoAction: null,
    };

    if (category === "important") {
      next.replyDraft = buildReply(email, options);
      next.autoAction = "reply";
    } else {
      next.replyDraft = undefined;
      const shouldUnsubscribe = decideUnsubscribe(email, options);
      if (shouldUnsubscribe) {
        next.autoAction = "unsubscribe";
      }
    }
    return next;
  });

  const summary = processed.reduce<AgentSummary>(
    (acc, email) => {
      if (email.category === "important") {
        acc.importantCount += 1;
      } else {
        acc.marketingCount += 1;
      }
      if (email.autoAction === "reply") acc.autoReplies += 1;
      if (email.autoAction === "unsubscribe") acc.autoUnsubscribes += 1;
      return acc;
    },
    { importantCount: 0, marketingCount: 0, autoReplies: 0, autoUnsubscribes: 0, pending: 0 },
  );

  summary.pending = processed.filter((email) => !email.autoAction).length;

  return { emails: processed, summary };
}

function decideUnsubscribe(email: EmailRecord, options: AgentOptions): boolean {
  const level = options.unsubscribeAggressiveness ?? "balanced";
  if (!email.unsubscribeLink) return level === "aggressive";
  if (level === "conservative") {
    return containsKeyword(email.body, ["unsubscribe", "manage your subscription"]);
  }
  if (level === "aggressive") return true;
  return containsKeyword(email.subject + email.body, ["newsletter", "exclusive", "deal", "promo"]);
}

