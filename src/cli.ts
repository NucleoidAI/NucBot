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

  bridge    Trello ↔ Slack bridge
            Opens a Slack thread when a card moves to In Progress,
            posts the PR link when it moves to In Review, sends
            staleness warnings and a daily EOD report.
            --setup             Register Trello webhook and exit
            -p, --port <port>   HTTP port (default: 3001)
            --db <path>         SQLite db path (default: .nucbot/bridge.db)

            Required env vars:
              TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID
              SLACK_BOT_TOKEN, SLACK_CHANNEL_ID

            Optional env vars:
              TRELLO_SECRET                    Webhook signature secret
              BRIDGE_PUBLIC_URL                Public URL for webhook registration
              BRIDGE_LIST_IN_PROGRESS          (default: "In Progress")
              BRIDGE_LIST_IN_REVIEW            (default: "In Review")
              BRIDGE_STALE_IN_PROGRESS_HOURS   (default: 48)
              BRIDGE_STALE_IN_REVIEW_HOURS     (default: 24)
              BRIDGE_REPORT_TIME               (default: "18:00")

Options:
  -h, --help     Show help
  -v, --version  Show version

Examples:
  nucbot init
  nucbot init --template link --name my-app
  nucbot init -t link-express -n my-api --login
  nucbot watcher --file ./docker-compose.yml
  nucbot bridge --setup
  nucbot bridge
`.trim(),
  );
}

await run();
