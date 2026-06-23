import { parseArgs } from "util";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { createHmac, timingSafeEqual } from "crypto";
import type { CommandHandler } from "../lib/types";

interface SyncConfig {
  source: string;
  target: string;
  branch?: string;
  secret?: string;
  workDir?: string;
  authorName?: string;
  authorEmail?: string;
}

const sync: CommandHandler = async (args) => {
  const { values } = parseArgs({
    args,
    options: {
      port: { type: "string", short: "p", default: "3002" },
      "github-url": { type: "string" },
      "gitlab-url": { type: "string" },
      branch: { type: "string", short: "b", default: "main" },
      secret: { type: "string", short: "s" },
      "work-dir": { type: "string" },
      "author-name": { type: "string" },
      "author-email": { type: "string" },
      config: { type: "string", short: "c" },
      setup: { type: "boolean" },
    },
  });

  const port = parseInt(values.port!);

  if (values.setup) {
    console.log(
      `
GitHub Webhook Setup
──────────────────────────────────────────
  Payload URL : <your-public-url>/github/webhook
  Content type: application/json
  Secret      : set per-repo via "secret" in config JSON or SYNC_WEBHOOK_SECRET env var
  Events      : Just the push event

GitLab Push Access
──────────────────────────────────────────
  Embed your token in the GitLab URL:
    https://oauth2:<TOKEN>@gitlab.com/user/repo.git
  Or configure SSH keys for the process user.

Config File Format
──────────────────────────────────────────
  nucbot sync --config repos.json

  repos.json:
  [
    {
      "source": "https://github.com/user/repo.git",
      "target": "https://oauth2:<TOKEN>@gitlab.com/user/repo.git",
      "branch": "main",
      "secret": "webhook-secret",
      "workDir": ".nucbot/repo-1",
      "authorName": "NucBot",
      "authorEmail": "bot@example.com"
    }
  ]

Author Identity
──────────────────────────────────────────
  Configure globally with:
    git config --global user.name "NucBot"
    git config --global user.email "bot@example.com"
`.trim(),
    );
    return;
  }

  const configs = loadConfigs(values);

  if (configs.length === 0) {
    console.error(
      "No sync targets configured. Use --config <file.json> or provide --github-url and --gitlab-url.",
    );
    process.exit(1);
  }

  for (const cfg of configs) {
    console.log(`[nucbot sync] Initializing ${cfg.source} → ${cfg.target}`);
    await initRepo(cfg.workDir!, cfg.source, cfg.target);
  }

  console.log(`[nucbot sync] Running initial sync for ${configs.length} repo(s)...`);
  await Promise.all(
    configs.map(async (cfg) => {
      await syncBranch(cfg.workDir!, cfg.branch!, cfg.authorName ?? null, cfg.authorEmail ?? null);
      console.log(`[nucbot sync] Done: ${cfg.source}`);
    }),
  );

  console.log();
  for (const cfg of configs) {
    console.log(`[nucbot sync] source       : ${cfg.source}`);
    console.log(`[nucbot sync] target       : ${cfg.target}`);
    console.log(`[nucbot sync] branch       : ${cfg.branch}`);
    console.log(
      `[nucbot sync] author       : ${cfg.authorName ?? "(git config default)"} <${cfg.authorEmail ?? "git config default"}>`,
    );
    console.log(`[nucbot sync] work dir     : ${cfg.workDir}`);
    console.log(
      `[nucbot sync] webhook auth : ${cfg.secret ? "enabled" : "disabled (no secret)"}`,
    );
    console.log();
  }
  console.log(`[nucbot sync] listening on : http://0.0.0.0:${port}`);
  console.log();

  Bun.serve({
    port,
    hostname: "0.0.0.0",
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method === "GET" && url.pathname === "/health") {
        return Response.json({ ok: true, repos: configs.length });
      }

      if (req.method !== "POST" || url.pathname !== "/github/webhook") {
        return new Response("Not found", { status: 404 });
      }

      const rawBody = await req.text();

      let payload: any;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return new Response("Bad request", { status: 400 });
      }

      const cfg = findConfig(configs, payload);
      if (!cfg) return new Response("OK", { status: 200 });

      if (cfg.secret) {
        const sig = req.headers.get("x-hub-signature-256");
        if (!verifySignature(cfg.secret, rawBody, sig)) {
          return new Response("Unauthorized", { status: 401 });
        }
      }

      const event = req.headers.get("x-github-event");
      if (event !== "push") return new Response("OK", { status: 200 });

      const pushedBranch = (payload.ref as string).replace("refs/heads/", "");
      if (pushedBranch !== cfg.branch) return new Response("OK", { status: 200 });

      const commitCount = (payload.commits ?? []).length;
      const headSha =
        (payload.after as string | undefined)?.slice(0, 7) ?? "unknown";
      const ts = new Date().toISOString();
      console.log(
        `[${ts}] Push on ${cfg.branch} (${commitCount} commit(s), HEAD: ${headSha}) [${cfg.source}] — syncing...`,
      );

      try {
        await syncBranch(cfg.workDir!, cfg.branch!, cfg.authorName ?? null, cfg.authorEmail ?? null);
        console.log(`[${ts}] Sync complete.`);
        return Response.json({ ok: true, commits: commitCount, head: headSha });
      } catch (err: any) {
        console.error(`[${ts}] Sync failed: ${err.message}`);
        return Response.json({ error: err.message }, { status: 500 });
      }
    },
  });
};

function loadConfigs(values: Record<string, any>): SyncConfig[] {
  if (values.config) {
    const raw = readFileSync(resolve(values.config), "utf-8");
    const items: SyncConfig[] = JSON.parse(raw);
    return items.map((item, i) => ({
      branch: "main",
      ...item,
      workDir: item.workDir
        ? resolve(item.workDir)
        : resolve(`.nucbot/sync-repo-${i}`),
      secret: item.secret ?? process.env.SYNC_WEBHOOK_SECRET ?? undefined,
    }));
  }

  const githubUrl = values["github-url"] ?? process.env.SYNC_GITHUB_URL;
  const gitlabUrl = values["gitlab-url"] ?? process.env.SYNC_GITLAB_URL;

  if (!githubUrl) {
    console.error("Missing --github-url, SYNC_GITHUB_URL, or --config");
    process.exit(1);
  }
  if (!gitlabUrl) {
    console.error("Missing --gitlab-url, SYNC_GITLAB_URL, or --config");
    process.exit(1);
  }

  return [
    {
      source: githubUrl,
      target: gitlabUrl,
      branch: values.branch ?? "main",
      secret: values.secret ?? process.env.SYNC_WEBHOOK_SECRET ?? undefined,
      workDir: resolve(values["work-dir"] ?? ".nucbot/sync-repo"),
      authorName: values["author-name"] ?? process.env.SYNC_AUTHOR_NAME ?? undefined,
      authorEmail: values["author-email"] ?? process.env.SYNC_AUTHOR_EMAIL ?? undefined,
    },
  ];
}

// Match incoming webhook payload to a config by comparing repository URLs.
function findConfig(configs: SyncConfig[], payload: any): SyncConfig | null {
  const repoUrls: string[] = [
    payload?.repository?.clone_url,
    payload?.repository?.ssh_url,
    payload?.repository?.html_url,
    payload?.repository?.git_url,
  ].filter(Boolean);

  for (const cfg of configs) {
    const normalizedSource = cfg.source.replace(/\.git$/, "").toLowerCase();
    for (const u of repoUrls) {
      if (u.replace(/\.git$/, "").toLowerCase() === normalizedSource) {
        return cfg;
      }
    }
  }

  // Fallback: if there's only one config, use it regardless
  if (configs.length === 1) return configs[0];

  return null;
}

async function initRepo(workDir: string, githubUrl: string, gitlabUrl: string) {
  if (!existsSync(workDir)) {
    mkdirSync(workDir, { recursive: true });
    await run("git", ["init", workDir], process.cwd());
  }

  const remotes = await listRemotes(workDir);
  if (remotes.includes("github")) {
    await run("git", ["remote", "set-url", "github", githubUrl], workDir);
  } else {
    await run("git", ["remote", "add", "github", githubUrl], workDir);
  }
  if (remotes.includes("gitlab")) {
    await run("git", ["remote", "set-url", "gitlab", gitlabUrl], workDir);
  } else {
    await run("git", ["remote", "add", "gitlab", gitlabUrl], workDir);
  }
}

async function syncBranch(
  workDir: string,
  branch: string,
  authorName: string | null,
  authorEmail: string | null,
) {
  await run("git", ["fetch", "github", branch], workDir);

  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
  };
  if (authorName) {
    env.GIT_AUTHOR_NAME = authorName;
    env.GIT_COMMITTER_NAME = authorName;
  }
  if (authorEmail) {
    env.GIT_AUTHOR_EMAIL = authorEmail;
    env.GIT_COMMITTER_EMAIL = authorEmail;
  }

  const gitConfigFlags = [
    ...(authorName ? ["-c", `user.name=${authorName}`] : []),
    ...(authorEmail ? ["-c", `user.email=${authorEmail}`] : []),
  ];

  const syncRef = `refs/sync/github-${branch}`;
  const syncRefExists = (await gitLines(["rev-parse", "--verify", syncRef], workDir).catch(() => [])).length > 0;

  const localBranches = await gitLines(["branch", "--list", branch], workDir);
  const localExists = localBranches.some(
    (b) => b.trim().replace(/^\*\s*/, "") === branch,
  );

  let newShas: string[];
  let currentHead: string | null = null;

  if (!localExists || !syncRefExists) {
    const resumeFromGithubSha = await findResumePoint(workDir, branch);

    if (resumeFromGithubSha) {
      console.log(`[nucbot sync] Resuming from tree match at ${resumeFromGithubSha.slice(0, 7)}...`);
      await run("git", ["update-ref", syncRef, resumeFromGithubSha], workDir);
      await run("git", ["checkout", "-B", branch, `gitlab/${branch}`], workDir);
      newShas = await gitLines(
        ["log", `${syncRef}..github/${branch}`, "--format=%H", "--reverse"],
        workDir,
      );
      currentHead = (await gitLines(["rev-parse", "HEAD"], workDir))[0];
      if (newShas.length === 0) {
        console.log("[nucbot sync] Already up to date.");
        return;
      }
      console.log(`[nucbot sync] Applying ${newShas.length} new commit(s)...`);
    } else {
      newShas = await gitLines(
        ["log", `github/${branch}`, "--format=%H", "--reverse"],
        workDir,
      );
      console.log(`[nucbot sync] Rewriting ${newShas.length} commit(s) with new author...`);
      if (localExists) {
        currentHead = (await gitLines(["rev-parse", branch], workDir))[0];
      }
    }
  } else {
    await run("git", ["checkout", "-B", branch, `refs/heads/${branch}`], workDir);
    newShas = await gitLines(
      ["log", `${syncRef}..github/${branch}`, "--format=%H", "--reverse"],
      workDir,
    );
    if (newShas.length === 0) {
      console.log("[nucbot sync] Already up to date.");
      return;
    }
    currentHead = (await gitLines(["rev-parse", "HEAD"], workDir))[0];
    console.log(`[nucbot sync] Applying ${newShas.length} new commit(s)...`);
  }

  for (const sha of newShas) {
    const tree = (await gitLines(["rev-parse", `${sha}^{tree}`], workDir))[0];
    const msg = await gitText(["log", "-1", "--format=%B", sha], workDir);
    const authorDate = (
      await gitLines(["log", "-1", "--format=%aI", sha], workDir)
    )[0];
    const commitDate = (
      await gitLines(["log", "-1", "--format=%cI", sha], workDir)
    )[0];
    const parentFlags = currentHead ? ["-p", currentHead] : [];
    const commitEnv = {
      ...env,
      GIT_AUTHOR_DATE: authorDate,
      GIT_COMMITTER_DATE: commitDate,
    };
    const newSha = await gitText(
      [
        ...gitConfigFlags,
        "commit-tree",
        tree,
        ...parentFlags,
        "-m",
        msg.trim(),
      ],
      workDir,
      commitEnv,
    );
    currentHead = newSha.trim();
  }

  if (!localExists) {
    await run("git", ["branch", branch, currentHead!], workDir);
    await run("git", ["checkout", branch], workDir);
  } else {
    await run("git", ["update-ref", `refs/heads/${branch}`, currentHead!], workDir);
  }

  const githubTip = (await gitLines(["rev-parse", `github/${branch}`], workDir))[0];
  await run("git", ["update-ref", syncRef, githubTip], workDir);

  console.log(`[nucbot sync] Done — ${newShas.length} commit(s) processed.`);
  await run("git", ["push", "--force", "gitlab", `${branch}:${branch}`], workDir);
}

async function findResumePoint(workDir: string, branch: string): Promise<string | null> {
  try {
    await run("git", ["fetch", "gitlab", branch], workDir);
  } catch {
    return null;
  }

  const gitlabTree = (await gitLines(["rev-parse", `gitlab/${branch}^{tree}`], workDir).catch(() => []))[0];
  if (!gitlabTree) return null;

  const githubShas = await gitLines(["log", `github/${branch}`, "--format=%H", "--reverse"], workDir);
  for (const sha of [...githubShas].reverse()) {
    const tree = (await gitLines(["rev-parse", `${sha}^{tree}`], workDir))[0];
    if (tree === gitlabTree) return sha;
  }

  return null;
}

async function run(
  cmd: string,
  args: string[],
  cwd: string,
  env?: Record<string, string>,
): Promise<void> {
  const proc = Bun.spawn([cmd, ...args], {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    env: env ?? (process.env as any),
  });
  const code = await proc.exited;
  if (code !== 0)
    throw new Error(`\`${cmd} ${args.join(" ")}\` exited with code ${code}`);
}

async function gitLines(args: string[], cwd: string): Promise<string[]> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;
  const text = await new Response(proc.stdout).text();
  return text.trim().split("\n").filter(Boolean);
}

async function gitText(
  args: string[],
  cwd: string,
  env?: Record<string, string>,
): Promise<string> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: env ?? (process.env as any),
  });
  await proc.exited;
  return new Response(proc.stdout).text();
}

async function listRemotes(cwd: string): Promise<string[]> {
  return gitLines(["remote"], cwd);
}

function verifySignature(
  secret: string,
  body: string,
  sig: string | null,
): boolean {
  if (!sig) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default sync;
