"use client";

import { useMemo, useState, useTransition } from "react";
import { processInbox, ProcessResult } from "@/lib/agent";
import { sampleInbox } from "@/lib/sampleEmails";
import { AgentOptions, EmailRecord } from "@/lib/types";

const defaultOptions: AgentOptions = {
  formalToneLevel: "balanced",
  unsubscribeAggressiveness: "balanced",
};

interface ComposerState {
  sender: string;
  subject: string;
  body: string;
}

const emptyComposer: ComposerState = {
  sender: "",
  subject: "",
  body: "",
};

export function AgentDashboard() {
  const [inbox, setInbox] = useState<EmailRecord[]>(sampleInbox);
  const [options, setOptions] = useState<AgentOptions>(defaultOptions);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [composer, setComposer] = useState<ComposerState>(emptyComposer);
  const [isPending, startTransition] = useTransition();

  const unresolvedCount = useMemo(() => inbox.filter((email) => !email.autoAction).length, [inbox]);

  const handleRunAgent = () => {
    startTransition(() => {
      const next = processInbox(inbox, options);
      setInbox(next.emails);
      setResult(next);
    });
  };

  const handleOptionChange = <K extends keyof AgentOptions>(key: K, value: AgentOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleComposerChange = (field: keyof ComposerState, value: string) => {
    setComposer((prev) => ({ ...prev, [field]: value }));
  };

  const handleInjectEmail = () => {
    if (!composer.sender || !composer.subject || !composer.body) return;
    const newEmail: EmailRecord = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `email-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      sender: composer.sender,
      subject: composer.subject,
      body: composer.body,
      receivedAt: new Date().toISOString(),
      status: "pending",
      autoAction: null,
    };
    setInbox((prev) => [newEmail, ...prev]);
    setComposer(emptyComposer);
    setResult(null);
  };

  const marketing = inbox.filter((email) => email.category === "marketing");
  const important = inbox.filter((email) => email.category === "important");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 py-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-white shadow-xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Autonomous Email Operations Agent
          </h1>
          <p className="max-w-3xl text-base text-slate-200">
            Classify your inbox, draft formal responses for urgent messages, and unsubscribe from marketing
            campaigns in one automated sweep. Adjust the strategy, review the agent&apos;s work, and deploy replies
            with confidence.
          </p>
        </div>
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <AgentMetric label="Inbox messages" value={inbox.length} />
          <AgentMetric label="Awaiting action" value={unresolvedCount} />
          <AgentMetric label="Last run status" value={result ? "Complete" : "Idle"} />
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Execution console</h2>
            <p className="text-sm text-slate-600">
              Configure tone and automation preferences, then launch the agent. Results persist so you can iterate on
              new options without losing the previous run.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <label htmlFor="tone" className="text-sm font-medium text-slate-700">
                Reply tone
              </label>
              <select
                id="tone"
                value={options.formalToneLevel}
                onChange={(event) => handleOptionChange("formalToneLevel", event.target.value as AgentOptions["formalToneLevel"])}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="balanced">Balanced professional</option>
                <option value="very_formal">Very formal</option>
              </select>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <label htmlFor="unsubscribe" className="text-sm font-medium text-slate-700">
                Marketing cleanup
              </label>
              <select
                id="unsubscribe"
                value={options.unsubscribeAggressiveness}
                onChange={(event) =>
                  handleOptionChange("unsubscribeAggressiveness", event.target.value as AgentOptions["unsubscribeAggressiveness"])
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="conservative">Only with explicit unsubscribe</option>
                <option value="balanced">Marketing keywords</option>
                <option value="aggressive">Unsubscribe everything promo-like</option>
              </select>
            </fieldset>
          </div>

          <button
            type="button"
            onClick={handleRunAgent}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Processing inbox..." : "Run email agent"}
          </button>

          {result && (
            <AgentSummaryPanel
              important={result.summary.importantCount}
              marketing={result.summary.marketingCount}
              replies={result.summary.autoReplies}
              unsubscribes={result.summary.autoUnsubscribes}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Inject a message</h2>
          <p className="text-sm text-slate-600">
            Paste an email that recently landed in your inbox to see how the agent triages it alongside the sample
            messages.
          </p>
          <input
            type="email"
            placeholder="sender@company.com"
            value={composer.sender}
            onChange={(event) => handleComposerChange("sender", event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <input
            type="text"
            placeholder="Subject line"
            value={composer.subject}
            onChange={(event) => handleComposerChange("subject", event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <textarea
            placeholder="Email body..."
            value={composer.body}
            onChange={(event) => handleComposerChange("body", event.target.value)}
            rows={6}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            type="button"
            onClick={handleInjectEmail}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-400/30 transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Add to inbox queue
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <EmailList title="Important emails" emails={important} />
        <EmailList title="Marketing to clean up" emails={marketing} />
      </section>
    </div>
  );
}

function AgentMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-slate-200">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}

interface SummaryProps {
  important: number;
  marketing: number;
  replies: number;
  unsubscribes: number;
}

function AgentSummaryPanel({ important, marketing, replies, unsubscribes }: SummaryProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-800">
      <h3 className="text-base font-semibold text-slate-900">Latest automation run</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Important" value={`${important} triaged`} />
        <SummaryItem label="Marketing" value={`${marketing} identified`} />
        <SummaryItem label="Formal replies drafted" value={replies} />
        <SummaryItem label="Unsubscribe actions" value={unsubscribes} />
      </div>
      <p className="rounded-xl bg-white px-4 py-3 text-xs text-slate-500">
        The agent applies heuristic intent analysis and policy-driven automation. Review drafts before sending to keep
        humans in the loop.
      </p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmailList({ emails, title }: { emails: EmailRecord[]; title: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-xs uppercase tracking-wide text-slate-500">{emails.length} messages</p>
      </div>
      <div className="flex flex-col gap-4">
        {emails.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No messages in this bucket yet. Run the agent or inject an email to populate the queue.
          </p>
        )}
        {emails.map((email) => (
          <article
            key={email.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{email.subject}</span>
                <span className="text-xs text-slate-500">{email.sender}</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {email.importanceScore ? `Score ${email.importanceScore}` : "Pending"}
              </span>
            </div>
            <p className="max-h-24 overflow-hidden text-ellipsis whitespace-pre-wrap text-slate-600">
              {email.body}
            </p>
            <div className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3">
              {email.autoAction === "reply" && email.replyDraft ? (
                <>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Drafted reply
                  </span>
                  <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs leading-relaxed text-slate-700">
                    {email.replyDraft}
                  </pre>
                </>
              ) : null}
              {email.autoAction === "unsubscribe" ? (
                <div className="flex items-center justify-between gap-4 text-xs text-slate-600">
                  <span>
                    Auto-marked for unsubscribe {email.unsubscribeLink ? "via provided link." : "using policy."}
                  </span>
                  {email.unsubscribeLink ? (
                    <a
                      href={email.unsubscribeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Open link
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
