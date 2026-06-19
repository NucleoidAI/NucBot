import { createHmac } from "crypto";

export type CardMovedEvent = {
  type: "cardMoved";
  card: { id: string; name: string; url: string };
  listBefore: string | null;
  listAfter: string;
};

export function parseWebhookBody(body: unknown): CardMovedEvent | null {
  const action = (body as any)?.action;
  if (!action) return null;

  if (action.type === "updateCard" && action.data?.listAfter) {
    return {
      type: "cardMoved",
      card: {
        id: action.data.card.id,
        name: action.data.card.name,
        url: action.data.card.url ?? `https://trello.com/c/${action.data.card.id}`,
      },
      listBefore: action.data.listBefore?.name ?? null,
      listAfter: action.data.listAfter.name,
    };
  }

  return null;
}

// Trello signs webhooks with HMAC-SHA1 over (body + callbackURL)
export function verifySignature(
  secret: string,
  rawBody: string,
  callbackUrl: string,
  header: string | null
): boolean {
  if (!header) return false;
  const expected = createHmac("sha1", secret)
    .update(rawBody + callbackUrl)
    .digest("base64");
  return expected === header;
}

// Fetch card details (description + attachments) to find a PR URL
export async function fetchCardPrUrl(
  cardId: string,
  apiKey: string,
  token: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.trello.com/1/cards/${cardId}?fields=desc&attachments=true&key=${apiKey}&token=${token}`
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    desc?: string;
    attachments?: Array<{ url: string }>;
  };

  const sources = [
    data.desc ?? "",
    ...(data.attachments ?? []).map((a) => a.url),
  ].join("\n");

  return extractPrUrl(sources);
}

// Register a webhook on a Trello board
export async function registerWebhook(
  boardId: string,
  callbackUrl: string,
  apiKey: string,
  token: string
): Promise<void> {
  const res = await fetch("https://api.trello.com/1/webhooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idModel: boardId,
      callbackURL: callbackUrl,
      description: "nucbot bridge",
      key: apiKey,
      token,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trello webhook registration failed: ${text}`);
  }
}

function extractPrUrl(text: string): string | null {
  const match = text.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
  return match ? match[0] : null;
}
