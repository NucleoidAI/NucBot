const chalk = require("chalk");
const { program } = require("commander");

const handlePlatformInit = require("./init/platformInit");
const createProjectFromTemplate = require("./utils/createProjectFromTemplate");

program.name("nucbot").description("Nucbot CLI tool").version("1.0.0");

program
  .command("init")
  .description("Initialize a new project")
  .option("-p, --platform <type>", "specify the platform")
  .option("-n, --name <name>", "enter a project name")
  .action(async (options) => {
    if (!options.platform && !options.name) {
      handlePlatformInit();
    } else {
      createProjectFromTemplate(options.name, options.platform);
    }
  });

program.on("command:*", () => {
  console.error(chalk.red("Invalid command."));
  console.log(chalk.yellow("\nAvailable commands:"));
  console.log("  init    Initialize a new project");
  console.log("  update  Update project components");
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
