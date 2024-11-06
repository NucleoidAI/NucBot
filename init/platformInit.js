const chalk = require("chalk");
const inquirer = require("inquirer");
const createProjectFromTemplate = require("../utils/createProjectFromTemplate");

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

