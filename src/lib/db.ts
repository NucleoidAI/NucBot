import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import { dirname } from "path";

export type Card = {
  id: string;
  name: string;
  url: string;
  list_name: string;
  slack_thread_ts: string | null;
  entered_at: number;
  stale_warned_at: number | null;
};

export type Event = {
  card_id: string;
  card_name: string;
  list_from: string | null;
  list_to: string;
  occurred_at: number;
};

export function openDb(path: string) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.run("PRAGMA journal_mode=WAL");

  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      url             TEXT NOT NULL,
      list_name       TEXT NOT NULL,
      slack_thread_ts TEXT,
      entered_at      INTEGER NOT NULL,
      stale_warned_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id      TEXT    NOT NULL,
      card_name    TEXT    NOT NULL,
      list_from    TEXT,
      list_to      TEXT    NOT NULL,
      occurred_at  INTEGER NOT NULL
    )
  `);

  return {
    upsertCard(card: Omit<Card, "stale_warned_at">) {
      db.run(
        `INSERT INTO cards (id, name, url, list_name, slack_thread_ts, entered_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name            = excluded.name,
           url             = excluded.url,
           list_name       = excluded.list_name,
           slack_thread_ts = COALESCE(excluded.slack_thread_ts, cards.slack_thread_ts),
           entered_at      = excluded.entered_at,
           stale_warned_at = NULL`,
        [card.id, card.name, card.url, card.list_name, card.slack_thread_ts, card.entered_at]
      );
    },

    setThreadTs(cardId: string, ts: string) {
      db.run("UPDATE cards SET slack_thread_ts = ? WHERE id = ?", [ts, cardId]);
    },

    setStaleWarned(cardId: string, at: number) {
      db.run("UPDATE cards SET stale_warned_at = ? WHERE id = ?", [at, cardId]);
    },

    removeCard(cardId: string) {
      db.run("DELETE FROM cards WHERE id = ?", [cardId]);
    },

    getCard(cardId: string): Card | null {
      return db
        .query<Card, string>("SELECT * FROM cards WHERE id = ?")
        .get(cardId);
    },

    getCardsByList(listName: string): Card[] {
      return db
        .query<Card, string>("SELECT * FROM cards WHERE list_name = ?")
        .all(listName);
    },

    getAllTracked(): Card[] {
      return db.query<Card, []>("SELECT * FROM cards").all();
    },

    logEvent(event: Event) {
      db.run(
        `INSERT INTO events (card_id, card_name, list_from, list_to, occurred_at)
         VALUES (?, ?, ?, ?, ?)`,
        [event.card_id, event.card_name, event.list_from, event.list_to, event.occurred_at]
      );
    },

    getEventsToday(): Event[] {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return db
        .query<Event, number>(
          "SELECT * FROM events WHERE occurred_at >= ? ORDER BY occurred_at ASC"
        )
        .all(startOfDay.getTime());
    },
  };
}

export type Db = ReturnType<typeof openDb>;
