const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const copyDirectory = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");
      fs.writeFileSync(destPath, content);
    }
  }""
};

const updateProject = (template) => {
  try {
    const templatePath = path.join(__dirname, "..", "templates", template);

    const projectPath = path.join(process.cwd(),"deneme");
    console.log(projectPath);
    if (fs.existsSync(projectPath)) {
        copyDirectory(templatePath, projectPath);
    } else {
      throw new Error(`Project does not exist`);
    }
  } catch (error) {
    console.error(chalk.red("Error updating project:", error.message));
    return false;
  }
};

module.exports = updateProject;

