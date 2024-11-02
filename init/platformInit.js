const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

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

const createProjectFromTemplate = (projectName, template) => {
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

const handlePlatformInit = async () => {
  try {
    const answers = await inquirer.default.prompt([
      {
        type: "list",
        name: "option",
        message: "Select an initialization option:",
        choices: ["platform", "platform-express"],
      },
      {
        type: "input",
        name: "name",
        message: "Enter a project name:",
        validate: (input) => {
          if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
          return "Please enter a valid project name (letters, numbers, hyphens, and underscores only)";
        },
      },
    ]);

    switch (answers.option) {
      case "platform":
        console.log(chalk.green("Initializing platform..."));
        if (createProjectFromTemplate(answers.name, "platform")) {
          console.log(
            chalk.green(`
Successfully created platform project: ${answers.name}

To get started:
  cd ${answers.name}
  npm install
  npm run dev
`)
          );
        }
        break;

      case "platform-express":
        console.log(chalk.blue("Initializing platform-express..."));
        if (createProjectFromTemplate(answers.name, "platform-express")) {
          console.log(
            chalk.blue(`
Successfully created platform-express project: ${answers.name}

To get started:
  cd ${answers.name}
  npm install
  npm start
`)
          );
        }
        break;
    }
  } catch (error) {
    console.error(chalk.red("Error:", error));
    process.exit(1);
  }
};

module.exports = handlePlatformInit;

