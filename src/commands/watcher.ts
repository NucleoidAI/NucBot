import { parseArgs } from "util";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "yaml";
import type { CommandHandler } from "../lib/types";

const watcher: CommandHandler = async (args) => {
  const { values } = parseArgs({
    args,
    options: {
      port:    { type: "string", short: "p", default: "3000" },
      file:    { type: "string", short: "f", default: "docker-compose.yml" },
      token:   { type: "string", short: "t" },
      project: { type: "string", short: "P" },
    },
  });

  const port        = parseInt(values.port!);
  const composeFile = resolve(values.file!);
  const secret      = values.token ?? process.env.NUCBOT_TOKEN;

  if (!secret) {
    console.error(
      "Error: auth token required.\n" +
      "  Pass --token <secret>  or  set NUCBOT_TOKEN env var."
    );
    process.exit(1);
  }

  if (!existsSync(composeFile)) {
    console.error(`docker-compose file not found: ${composeFile}`);
    process.exit(1);
  }

  const compose     = parse(readFileSync(composeFile, "utf8"));
  const services    = new Set<string>(Object.keys(compose.services ?? {}));
  // Use explicit --project, then compose file's "name:" field, then nothing
  // (docker compose will derive from directory name — fine for host runs).
  const projectName = values.project ?? compose.name ?? null;

  if (services.size === 0) {
    console.error("No services found in compose file.");
    process.exit(1);
  }

  const projectFlag = projectName ? ["-p", projectName] : [];

  console.log(`[nucbot watcher] compose file : ${composeFile}`);
  if (projectName) console.log(`[nucbot watcher] project      : ${projectName}`);
  console.log(`[nucbot watcher] services     : ${[...services].join(", ")}`);
  console.log(`[nucbot watcher] auth         : Bearer token enabled`);
  console.log(`[nucbot watcher] listening on : http://0.0.0.0:${port}`);
  console.log();
  for (const s of services) console.log(`  POST /${s}`);
  console.log();

  Bun.serve({
    port,
    hostname: "0.0.0.0",
    async fetch(req) {
      const auth = req.headers.get("authorization") ?? "";
      if (auth !== `Bearer ${secret}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (req.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }

      const service = new URL(req.url).pathname.replace(/^\//, "");

      if (!service || !services.has(service)) {
        return Response.json(
          { error: `Unknown service: "${service}"`, available: [...services] },
          { status: 404 }
        );
      }

      const ts = new Date().toISOString();
      console.log(`[${ts}] Updating ${service}...`);

      const pull = await Bun.spawn(
        ["docker", "compose", ...projectFlag, "-f", composeFile, "pull", service],
        { stdout: "inherit", stderr: "inherit" }
      ).exited;

      if (pull !== 0) {
        console.error(`[${ts}] Pull failed for ${service} (exit ${pull})`);
        return Response.json({ error: "Pull failed", service }, { status: 500 });
      }

      const up = await Bun.spawn(
        ["docker", "compose", ...projectFlag, "-f", composeFile, "up", "-d", "--no-deps", service],
        { stdout: "inherit", stderr: "inherit" }
      ).exited;

      if (up !== 0) {
        console.error(`[${ts}] Deploy failed for ${service} (exit ${up})`);
        return Response.json({ error: "Deploy failed", service }, { status: 500 });
      }

      console.log(`[${ts}] ${service} updated successfully.`);
      return Response.json({ ok: true, service, updatedAt: ts });
    },
  });
};

export default watcher;
