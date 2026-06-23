#!/usr/bin/env bun

import { parseArgs } from "util";
import { version } from "../package.json";

// Split: top-level flags come before the command name, everything after belongs to the command.
const allArgs = Bun.argv.slice(2);
const cmdIndex = allArgs.findIndex((a) => !a.startsWith("-"));
const topArgs = cmdIndex >= 0 ? allArgs.slice(0, cmdIndex) : allArgs;
const command = cmdIndex >= 0 ? allArgs[cmdIndex] : undefined;
const args = cmdIndex >= 0 ? allArgs.slice(cmdIndex + 1) : [];

const { values } = parseArgs({
  args: topArgs,
  options: {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  },
});

if (values.version) {
  console.log(`nucbot v${version}`);
  process.exit(0);
}

if (!command || values.help) {
  printHelp();
  process.exit(0);
}

async function run() {
  try {
    const mod = await import(`./commands/${command}.ts`);
    await mod.default(args);
  } catch (e: any) {
    if (e?.code === "ERR_MODULE_NOT_FOUND") {
      console.error(`Unknown command: ${command}`);
      console.error('Run "nucbot --help" for available commands.');
      process.exit(1);
    }
    throw e;
  }
}

function printHelp() {
  console.log(
    `
nucbot v${version} — Nucleoid project bootstrapper

Usage:
  nucbot <command> [args]

Commands:
  init      Initialize a new project
            -t, --template <type>   Template (link | link-express)
            -n, --name <name>       Project name
            --login                 Include authentication/login

  watcher   Pull & redeploy docker-compose services via POST endpoints
            -f, --file <path>   Compose file (default: docker-compose.yml)
            -p, --port <port>   HTTP port (default: 3000)
            -t, --token         Auth token (or NUCBOT_TOKEN env)

  sync      One-way GitHub → GitLab commit sync
            Listens for GitHub push webhooks and cherry-picks each
            new commit onto GitLab, preserving the commit message
            but replacing author info with the local git identity.
            --setup              Print webhook setup instructions and exit
            -p, --port <port>    HTTP port (default: 3002)
            -b, --branch <name>  Branch to sync (default: main)
            -s, --secret <val>   GitHub webhook secret (or SYNC_WEBHOOK_SECRET)
            --github-url <url>   Source GitHub repo URL (or SYNC_GITHUB_URL)
            --gitlab-url <url>   Target GitLab repo URL (or SYNC_GITLAB_URL)
            --work-dir <path>        Local clone path (default: .nucbot/sync-repo)
            --author-name <name>     Committer name on GitLab (or SYNC_AUTHOR_NAME)
            --author-email <email>   Committer email on GitLab (or SYNC_AUTHOR_EMAIL)

            Required env vars:
              SYNC_GITHUB_URL, SYNC_GITLAB_URL

            Optional env vars:
              SYNC_WEBHOOK_SECRET   GitHub webhook signature secret
              SYNC_AUTHOR_NAME      Committer name written to GitLab commits
              SYNC_AUTHOR_EMAIL     Committer email written to GitLab commits

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  nucbot init
  nucbot init --template link --name my-app
  nucbot init -t link-express -n my-api --login
  nucbot watcher --file ./docker-compose.yml
  nucbot sync --github-url https://github.com/org/repo.git --gitlab-url https://oauth2:TOKEN@gitlab.com/org/repo.git
  nucbot sync --setup
`.trim(),
  );
}

await run();
