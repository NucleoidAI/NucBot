type PostResult = { ok: boolean; ts?: string; error?: string };

export class SlackClient {
  constructor(
    private readonly token: string,
    private readonly channel: string
  ) {}

  async post(text: string, threadTs?: string): Promise<string> {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: this.channel,
        text,
        unfurl_links: false,
        ...(threadTs ? { thread_ts: threadTs } : {}),
      }),
    });

    const data = (await res.json()) as PostResult;
    if (!data.ok) throw new Error(`Slack error: ${data.error}`);
    return data.ts!;
  }

  // Convenience: reply into an existing thread
  reply(threadTs: string, text: string) {
    return this.post(text, threadTs);
  }
}

// ── Message templates ────────────────────────────────────────────────────────

export function msgInProgress(name: string, url: string): string {
  return `🚀 *${name}* is now *In Progress*\n<${url}|View card>`;
}

export function msgInReview(name: string, prUrl: string | null): string {
  const pr = prUrl ? `\nPR: ${prUrl}` : "\n_No PR link found on the card._";
  return `👀 Moved to *In Review*${pr}`;
}

export function msgStale(
  name: string,
  url: string,
  listName: string,
  hours: number
): string {
  return `⚠️ *${name}* has been in *${listName}* for ${formatHours(hours)}\n<${url}|View card>`;
}

export function msgDailyReport(
  inProgress: Array<{ name: string; url: string; hours: number }>,
  inReview: Array<{ name: string; url: string; hours: number; prUrl?: string | null }>,
  completedToday: Array<{ name: string; list_to: string }>
): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const lines: string[] = [`📊 *Daily Report — ${date}*`];

  if (inProgress.length) {
    lines.push(`\n*In Progress (${inProgress.length})*`);
    for (const c of inProgress)
      lines.push(`• <${c.url}|${c.name}> — ${formatHours(c.hours)}`);
  } else {
    lines.push("\n*In Progress* — none");
  }

  if (inReview.length) {
    lines.push(`\n*In Review (${inReview.length})*`);
    for (const c of inReview) {
      const pr = c.prUrl ? ` · <${c.prUrl}|PR>` : "";
      lines.push(`• <${c.url}|${c.name}> — ${formatHours(c.hours)}${pr}`);
    }
  } else {
    lines.push("\n*In Review* — none");
  }

  if (completedToday.length) {
    lines.push(`\n*Completed today (${completedToday.length})*`);
    for (const c of completedToday) lines.push(`• ${c.name} → ${c.list_to}`);
  }

  return lines.join("\n");
}

function formatHours(h: number): string {
  if (h < 1) return "<1h";
  if (h < 24) return `${Math.floor(h)}h`;
  const d = Math.floor(h / 24);
  const rem = Math.floor(h % 24);
  return rem ? `${d}d ${rem}h` : `${d}d`;
}
