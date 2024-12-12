const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const chalk = require("chalk");

const createConfig = require("./createConfig");
const formatObjectToString = require("./formatObjectToString");

const copyDirectory = (src, dest, projectName, appId, login, type) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, projectName, appId, login, type);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");

      const config = createConfig(type, entry.name);

      content = content
        .
        replace(
          /\{\{project\}\}/g,
          login.enabled
            ? `,project: ${formatObjectToString(config.project, 2)}`
            : ""
        )
        .replace(
          /\{\{login\}\}/g,
          login.enabled
            ? `,login: ${formatObjectToString(config.login, 2)},`
            : ""
        )
        .replace(
          /\{\{projectBar\}\}/g,
          login.enabled
            ? `projectBar: ${formatObjectToString(config.projectBar, 2)}`
            : ""
        )
        .replace(/\{\{projectName\}\}/g, projectName)
        .replace(/\{\{appId\}\}/g, appId)
        .replace(
          /\{\{layout1\}\}/g,
          login.enabled ? `DashboardLayout` : "MainLayout"
        )
        .replace(
          /\{\{layout2\}\}/g,
          login.enabled ? `FullScreenLayout` : "SimpleLayout"
        );

      fs.writeFileSync(destPath, content);
    }
  }
};

const createProject = (projectConfig) => {
  try {
    console.log(projectConfig)
    const { name, type, login } = projectConfig;
    const appId = uuid.v4();

    const templatePath = path.join(__dirname, "..", "templates", type);
    const projectPath = path.join(process.cwd(), name);

    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory ${name} already exists`);
    }

    copyDirectory(templatePath, projectPath, name, appId, login, type);

    return true;
  } catch (error) {
    console.error(chalk.red("Error creating project:", error.message));
    return false;
  }
};

module.exports = createProject;

