#!/usr/bin/env bun
// Builds self-contained binaries for all supported platforms.
// Usage: bun scripts/build.ts [--target linux-x64|linux-arm64|darwin-arm64|darwin-x64]

import { parseArgs } from "util";
import { mkdirSync } from "fs";

const TARGETS = [
  { bun: "bun-linux-x64",   name: "linux-x64"   },
  { bun: "bun-linux-arm64", name: "linux-arm64" },
  { bun: "bun-darwin-x64",  name: "darwin-x64"  },
  { bun: "bun-darwin-arm64",name: "darwin-arm64"},
] as const;

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: { target: { type: "string" } },
});

const targets = values.target
  ? TARGETS.filter((t) => t.name === values.target)
  : TARGETS;

if (targets.length === 0) {
  console.error(`Unknown target: ${values.target}`);
  console.error(`Available: ${TARGETS.map((t) => t.name).join(", ")}`);
  process.exit(1);
}

mkdirSync("dist", { recursive: true });

for (const target of targets) {
  const out = `dist/nucbot-${target.name}`;
  console.log(`Building ${out}...`);

  const result = await Bun.spawn([
    "bun", "build", "src/cli.ts",
    "--compile",
    `--target=${target.bun}`,
    `--outfile=${out}`,
  ], { stdout: "inherit", stderr: "inherit" }).exited;

  if (result !== 0) {
    console.error(`Failed: ${target.name}`);
    process.exit(result);
  }

  console.log(`  -> ${out}`);
}

console.log("\nDone.");
