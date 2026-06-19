import type { Db } from "./db";
import { SlackClient, msgStale, msgDailyReport } from "./slack";

type Config = {
  db: Db;
  slack: SlackClient;
  listInProgress: string;
  listInReview: string;
  staleInProgressHours: number;
  staleInReviewHours: number;
  reportTime: string; // "HH:MM"
};

export function startScheduler(cfg: Config) {
  // Staleness check — every hour
  const staleInterval = setInterval(
    () => checkStaleness(cfg),
    60 * 60 * 1000
  );
  checkStaleness(cfg); // run immediately on start

  // Daily report — at configured time each day
  scheduleDailyReport(cfg);

  return () => clearInterval(staleInterval);
}

function checkStaleness(cfg: Config) {
  const now = Date.now();
  const thresholds: Record<string, number> = {
    [cfg.listInProgress]: cfg.staleInProgressHours * 3_600_000,
    [cfg.listInReview]: cfg.staleInReviewHours * 3_600_000,
  };

  for (const card of cfg.db.getAllTracked()) {
    const threshold = thresholds[card.list_name];
    if (!threshold) continue;

    const age = now - card.entered_at;
    if (age < threshold) continue;

    // Only warn once per threshold crossing
    if (card.stale_warned_at && card.stale_warned_at > card.entered_at) continue;

    const hours = age / 3_600_000;
    const text = msgStale(card.name, card.url, card.list_name, hours);

    cfg.slack
      .post(text, card.slack_thread_ts ?? undefined)
      .then(() => cfg.db.setStaleWarned(card.id, now))
      .catch(console.error);
  }
}

function scheduleDailyReport(cfg: Config) {
  const [h = 18, m = 0] = cfg.reportTime.split(":").map(Number);

  function fireAt(hour: number, minute: number) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target.getTime() - now.getTime();
  }

  function schedule() {
    setTimeout(() => {
      sendDailyReport(cfg).catch(console.error);
      // Schedule next day
      setTimeout(schedule, 500);
    }, fireAt(h, m));
  }

  schedule();
}

async function sendDailyReport(cfg: Config) {
  const now = Date.now();

  const inProgress = cfg.db.getCardsByList(cfg.listInProgress).map((c) => ({
    name: c.name,
    url: c.url,
    hours: (now - c.entered_at) / 3_600_000,
  }));

  const inReview = cfg.db.getCardsByList(cfg.listInReview).map((c) => ({
    name: c.name,
    url: c.url,
    hours: (now - c.entered_at) / 3_600_000,
    prUrl: null as string | null,
  }));

  const todayEvents = cfg.db.getEventsToday();
  const trackedLists = new Set([cfg.listInProgress, cfg.listInReview]);
  const completedToday = todayEvents
    .filter((e) => e.list_from && trackedLists.has(e.list_from) && !trackedLists.has(e.list_to))
    .map((e) => ({ name: e.card_name, list_to: e.list_to }));

  const text = msgDailyReport(inProgress, inReview, completedToday);
  await cfg.slack.post(text);
}
