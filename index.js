const chalk = require('chalk');
const { program } =  require('commander');
const handlePlatformInit = require('./init/platformInit');



program
  .name('nucbot')
  .description('Nucbot CLI tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .action(handlePlatformInit);

program
  .on('command:*', () => {
    console.error(chalk.red('Invalid command.'));
    console.log(chalk.yellow('\nAvailable commands:'));
    console.log('  init    Initialize a new project');
    console.log('  update  Update project components');
    process.exit(1);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}