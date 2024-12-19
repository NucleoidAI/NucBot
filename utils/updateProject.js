const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const copyDirectory = (src, dest) => {
  const filesToCopy = [
    '.eslintrc.json',
    '.gitattributes',
    '.gitignore',
    '.prettierignore',
    '.prettierrc',
    'Dockerfile',
    'cypress.config.js',
    'prepare.cjs'
  ];

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  for (const fileName of filesToCopy) {
    const srcPath = path.join(src, fileName);
    const destPath = path.join(dest, fileName);
    
    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath, 'utf8');
      fs.writeFileSync(destPath, content);
    }
  }
};

const updateProject = (template) => {
  try {
    const templatePath = path.join(__dirname, "..", "templates", template);

    const projectPath = path.join(process.cwd(),"deneme");

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

