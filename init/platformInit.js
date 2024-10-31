const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const generateConfigs = require("../template/platform/generateConfigs");
const eslintrcContent = require("../template/platform/eslintrc");
const prettierContent = require("../template/platform/prettier");
const packageJson = require("../template/platform/packageJson");

const createDirectoryStructure = (projectName, template) => {
  fs.mkdirSync(projectName);

  fs.mkdirSync(path.join(projectName, "src"));

  if (template === "platform") {
    const appId = uuid.v4();

    const { dev, land, live } = generateConfigs(projectName, appId);
    const packageJsonContent = packageJson(projectName);

    fs.writeFileSync(path.join(projectName, "config.js"), dev);
    fs.writeFileSync(path.join(projectName, "config.land.js"), land);
    fs.writeFileSync(path.join(projectName, "config.live.js"), live);

    fs.writeFileSync(path.join(projectName, ".prettierrc"), prettierContent);
    fs.writeFileSync(path.join(projectName, ".eslintrc.json"), eslintrcContent);

    fs.mkdirSync(path.join(projectName, "src", "components"));
    fs.mkdirSync(path.join(projectName, "src", "widgets"));
    fs.mkdirSync(path.join(projectName, "src", "layouts"));
    fs.mkdirSync(path.join(projectName, "src", "pages"));

    fs.writeFileSync(
      path.join(projectName, "package.json"),
      JSON.stringify(packageJsonContent, null, 2)
    );
  }

  if (template === "platform-express") {
    //TODO
  }

  const gitignoreContent = `node_modules
.env
`;

  fs.writeFileSync(path.join(projectName, ".gitignore"), gitignoreContent);
  fs.writeFileSync(
    path.join(projectName, ".gitattributes"),
    `* text=auto eol=lf`
  );
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
        createDirectoryStructure(answers.name, "platform");
        console.log(
          chalk.green(`
Successfully created platform project: ${answers.name}

To get started:
  cd ${answers.name}
  npm install
  npm start
`)
        );
        break;

      case "platform-express":
        console.log(chalk.blue("Initializing platform-express..."));
        createDirectoryStructure(answers.name, "platform-express");
        console.log(
          chalk.blue(`
Successfully created platform-express project: ${answers.name}

To get started:
  cd ${answers.name}
  npm install
  npm start
`)
        );
        break;
    }
  } catch (error) {
    console.error(chalk.red("Error:", error));
    process.exit(1);
  }
};

module.exports = handlePlatformInit;

