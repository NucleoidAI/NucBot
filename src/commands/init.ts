import { parseArgs } from "util";
import { createProject } from "../lib/createProject";
import type { CommandHandler, Template } from "../lib/types";

const TEMPLATES: Template[] = ["link", "link-express"];
const NAME_RE = /^[a-zA-Z0-9-_]+$/;

const init: CommandHandler = async (args) => {
  const { values } = parseArgs({
    args,
    options: {
      template: { type: "string", short: "t" },
      name:     { type: "string", short: "n" },
      login:    { type: "boolean" },
    },
  });

  const interactive = !values.template && !values.name;

  const template = interactive
    ? promptTemplate()
    : assertTemplate(values.template);

  const name = interactive
    ? promptName()
    : assertName(values.name);

  const loginEnabled = interactive
    ? confirm("Include authentication/login functionality?")
    : Boolean(values.login);

  console.log(`Initializing ${template}...`);

  const ok = createProject({
    name,
    type: template,
    login: { enabled: loginEnabled },
  });

  if (!ok) process.exit(1);

  const startCmd = template === "link-express" ? "bun start" : "bun run dev";
  console.log(`
Successfully created ${template} project: ${name}${loginEnabled ? "\nAuthentication functionality included" : ""}

To get started:
  cd ${name}
  bun install
  ${startCmd}
`);
};

function promptTemplate(): Template {
  console.log("Select a template:");
  TEMPLATES.forEach((t, i) => console.log(`  ${i + 1}) ${t}`));
  while (true) {
    const raw = prompt("Enter choice [1]:") ?? "1";
    const value = raw.trim() === "" ? "1" : raw.trim();
    const idx = parseInt(value, 10) - 1;
    if (TEMPLATES[idx]) return TEMPLATES[idx];
    if ((TEMPLATES as readonly string[]).includes(value)) return value as Template;
    console.error(`Invalid choice: ${raw}`);
  }
}

function promptName(): string {
  while (true) {
    const raw = prompt("Project name:");
    if (raw && NAME_RE.test(raw.trim())) return raw.trim();
    console.error("Please enter a valid project name (letters, numbers, hyphens, and underscores only)");
  }
}

function assertTemplate(value: string | undefined): Template {
  if (!value || !(TEMPLATES as readonly string[]).includes(value)) {
    console.error(`Invalid --template "${value ?? ""}". Expected one of: ${TEMPLATES.join(", ")}`);
    process.exit(1);
  }
  return value as Template;
}

function assertName(value: string | undefined): string {
  if (!value || !NAME_RE.test(value)) {
    console.error("Invalid --name. Use letters, numbers, hyphens, and underscores only.");
    process.exit(1);
  }
  return value;
}

export default init;
