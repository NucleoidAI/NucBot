const chalk = require("chalk");
const inquirer = require("inquirer");
const createProject = require("../utils/createProject");

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
      {
        type: "confirm",
        name: "includeLogin",
        message:
          "Would you like to include authentication/login functionality?",
        default: false,
      },
    ]);

    const projectConfig = {
      name: answers.name,
      type: answers.option,
      login: answers.includeLogin
        ? {
            enabled: true,
          }
        : { enabled: false },
    };

    switch (answers.option) {
      case "platform":
        console.log(chalk.green("Initializing platform..."));
        if (createProject(projectConfig)) {
          console.log(
            chalk.green(`
Successfully created platform project: ${answers.name}
${answers.includeLogin ? "Authentication functionality included" : ""}

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
        if (createProject(projectConfig)) {
          console.log(
            chalk.blue(`
Successfully created platform-express project: ${answers.name}
${answers.includeLogin ? "Authentication functionality included" : ""}

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

