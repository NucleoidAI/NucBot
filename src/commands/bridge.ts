import { parseArgs } from "util";
import { resolve } from "path";
import { openDb } from "../lib/db";
import { SlackClient, msgInProgress, msgInReview } from "../lib/slack";
import {
  parseWebhookBody,
  verifySignature,
  fetchCardPrUrl,
  registerWebhook,
} from "../lib/trello";
import { startScheduler } from "../lib/scheduler";
import type { CommandHandler } from "../lib/types";

const bridge: CommandHandler = async (args) => {
  const { values } = parseArgs({
    args,
    options: {
      port:   { type: "string", short: "p", default: "3001" },
      db:     { type: "string", default: ".nucbot/bridge.db" },
      setup:  { type: "boolean" },
    },
  });

  const env = {
    trelloKey:         required("TRELLO_API_KEY"),
    trelloToken:       required("TRELLO_TOKEN"),
    trelloSecret:      process.env.TRELLO_SECRET ?? null,
    boardId:           required("TRELLO_BOARD_ID"),
    slackToken:        required("SLACK_BOT_TOKEN"),
    slackChannel:      required("SLACK_CHANNEL_ID"),
    publicUrl:         process.env.BRIDGE_PUBLIC_URL ?? null,
    listInProgress:    process.env.BRIDGE_LIST_IN_PROGRESS ?? "In Progress",
    listInReview:      process.env.BRIDGE_LIST_IN_REVIEW   ?? "In Review",
    staleProgressHours:Number(process.env.BRIDGE_STALE_IN_PROGRESS_HOURS ?? 48),
    staleReviewHours:  Number(process.env.BRIDGE_STALE_IN_REVIEW_HOURS   ?? 24),
    reportTime:        process.env.BRIDGE_REPORT_TIME ?? "18:00",
  };

  // ── setup mode: register Trello webhook and exit ──────────────────────────
  if (values.setup) {
    if (!env.publicUrl) {
      console.error("BRIDGE_PUBLIC_URL is required for --setup");
      process.exit(1);
    }
    const callbackUrl = `${env.publicUrl}/trello/webhook`;
    console.log(`Registering Trello webhook → ${callbackUrl}`);
    await registerWebhook(env.boardId, callbackUrl, env.trelloKey, env.trelloToken);
    console.log("Done. You can now start the bridge without --setup.");
    return;
  }

  // ── normal start ──────────────────────────────────────────────────────────
  const port        = parseInt(values.port!);
  const dbPath      = resolve(values.db!);
  const db          = openDb(dbPath);
  const slack       = new SlackClient(env.slackToken, env.slackChannel);
  const callbackUrl = env.publicUrl
    ? `${env.publicUrl}/trello/webhook`
    : `http://0.0.0.0:${port}/trello/webhook`;

  console.log(`[nucbot bridge] db            : ${dbPath}`);
  console.log(`[nucbot bridge] in progress   : "${env.listInProgress}"`);
  console.log(`[nucbot bridge] in review     : "${env.listInReview}"`);
  console.log(`[nucbot bridge] stale warn    : ${env.staleProgressHours}h / ${env.staleReviewHours}h`);
  console.log(`[nucbot bridge] daily report  : ${env.reportTime}`);
  console.log(`[nucbot bridge] webhook url   : ${callbackUrl}`);
  console.log(`[nucbot bridge] listening on  : http://0.0.0.0:${port}`);
  console.log();

  startScheduler({
    db,
    slack,
    listInProgress:       env.listInProgress,
    listInReview:         env.listInReview,
    staleInProgressHours: env.staleProgressHours,
    staleInReviewHours:   env.staleReviewHours,
    reportTime:           env.reportTime,
  });

  Bun.serve({
    port,
    hostname: "0.0.0.0",
    async fetch(req) {
      const url = new URL(req.url);

      // Trello verifies the webhook endpoint with a HEAD request
      if (req.method === "HEAD" && url.pathname === "/trello/webhook") {
        return new Response(null, { status: 200 });
      }

      if (req.method !== "POST" || url.pathname !== "/trello/webhook") {
        return new Response("Not found", { status: 404 });
      }

      const rawBody = await req.text();

      // Verify signature if secret is configured
      if (env.trelloSecret) {
        const sig = req.headers.get("x-trello-webhook");
        if (!verifySignature(env.trelloSecret, rawBody, callbackUrl, sig)) {
          return new Response("Unauthorized", { status: 401 });
        }
      }

      let body: unknown;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return new Response("Bad request", { status: 400 });
      }

      const event = parseWebhookBody(body);
      if (!event) return new Response("OK", { status: 200 });

      const { card, listBefore, listAfter } = event;
      const now = Date.now();

      // Log every move for daily report
      db.logEvent({
        card_id: card.id,
        card_name: card.name,
        list_from: listBefore,
        list_to: listAfter,
        occurred_at: now,
      });

      const isTracked = [env.listInProgress, env.listInReview].includes(listAfter);

      // Card left tracked lists → remove from active tracking
      if (!isTracked) {
        db.removeCard(card.id);
        return new Response("OK", { status: 200 });
      }

      const existing = db.getCard(card.id);

      // ── In Progress ───────────────────────────────────────────────────────
      if (listAfter === env.listInProgress) {
        db.upsertCard({
          id: card.id,
          name: card.name,
          url: card.url,
          list_name: listAfter,
          slack_thread_ts: existing?.slack_thread_ts ?? null,
          entered_at: now,
        });

        if (!existing?.slack_thread_ts) {
          const ts = await slack.post(msgInProgress(card.name, card.url));
          db.setThreadTs(card.id, ts);
        } else {
          await slack.reply(
            existing.slack_thread_ts,
            `🔄 Back to *In Progress*`
          );
        }
      }

      // ── In Review ─────────────────────────────────────────────────────────
      if (listAfter === env.listInReview) {
        db.upsertCard({
          id: card.id,
          name: card.name,
          url: card.url,
          list_name: listAfter,
          slack_thread_ts: existing?.slack_thread_ts ?? null,
          entered_at: now,
        });

        const prUrl = await fetchCardPrUrl(
          card.id,
          env.trelloKey,
          env.trelloToken
        );

        const threadTs = existing?.slack_thread_ts;
        if (threadTs) {
          await slack.reply(threadTs, msgInReview(card.name, prUrl));
        } else {
          // No thread yet (card moved directly to review)
          const ts = await slack.post(
            `👀 *${card.name}* is in *In Review*\n<${card.url}|View card>`
          );
          await slack.reply(ts, msgInReview(card.name, prUrl));
          db.setThreadTs(card.id, ts);
        }
      }

      return new Response("OK", { status: 200 });
    },
  });
};

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
  return val;
}

export default bridge;
