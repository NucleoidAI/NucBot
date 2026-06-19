import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { createConfig } from "./createConfig";
import { formatObjectToString } from "./formatObjectToString";
import type { ProjectConfig, LoginConfig, Template } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyDirectory(
  src: string,
  dest: string,
  projectName: string,
  appId: string,
  login: LoginConfig,
  type: Template,
) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath  = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, projectName, appId, login, type);
      continue;
    }

    const config = createConfig(type, entry.name);
    const content = readFileSync(srcPath, "utf8")
      .replace(
        /\{\{project\}\}/g,
        login.enabled
          ? `,project: ${formatObjectToString(config.project, 2)}`
          : "",
      )
      .replace(
        /\{\{login\}\}/g,
        login.enabled
          ? `,login: ${formatObjectToString(config.login, 2)},`
          : "",
      )
      .replace(
        /\{\{projectBar\}\}/g,
        login.enabled
          ? `projectBar: ${formatObjectToString(config.projectBar, 2)}`
          : "",
      )
      .replace(/\{\{projectName\}\}/g, projectName)
      .replace(/\{\{appId\}\}/g, appId)
      .replace(/\{\{layout1\}\}/g, login.enabled ? "DashboardLayout" : "MainLayout")
      .replace(/\{\{layout2\}\}/g, login.enabled ? "FullScreenLayout" : "SimpleLayout");

    writeFileSync(destPath, content);
  }
}

export function createProject(projectConfig: ProjectConfig): boolean {
  try {
    const { name, type, login } = projectConfig;
    const appId = randomUUID();

    // templates/ lives at the repo root, two levels above src/lib
    const templatePath = resolve(__dirname, "..", "..", "templates", type);
    const projectPath  = resolve(process.cwd(), name);

    if (!existsSync(templatePath)) {
      throw new Error(`Template not found: ${type}`);
    }

    if (existsSync(projectPath)) {
      throw new Error(`Directory ${name} already exists`);
    }

    copyDirectory(templatePath, projectPath, name, appId, login, type);

    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Error creating project: ${msg}`);
    return false;
  }
}
