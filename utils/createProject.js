const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const chalk = require("chalk");

const copyDirectory = (src, dest, projectName, appId) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, projectName, appId);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");

      content = content
        .replace(/\{\{projectName\}\}/g, projectName)
        .replace(/\{\{appId\}\}/g, appId);

      fs.writeFileSync(destPath, content);
    }
  }
};

const createProject = (projectName, template) => {
  try {
    const appId = uuid.v4();

    const templatePath = path.join(__dirname, "..", "templates", template);

    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory ${projectName} already exists`);
    }

    copyDirectory(templatePath, projectPath, projectName, appId);

    return true;
  } catch (error) {
    console.error(chalk.red("Error creating project:", error.message));
    return false;
  }
};

module.exports = createProject;
