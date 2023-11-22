const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const os = require("os");

const tempDir = os.tmpdir();
const folderId = uuidv4();

const repoDir = path.join(tempDir, folderId);

execSync(`git clone https://github.com/NucleoidJS/Nucleoid ${repoDir}`);

function readDirR(dir) {
  return fs.statSync(dir).isDirectory()
    ? Array.prototype.concat(
        ...fs.readdirSync(dir).map((f) => readDirR(path.join(dir, f)))
      )
    : dir;
}

let files = readDirR(repoDir);

let backupContent = "";

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  backupContent += `# ${file}\n\n${content}\n`;
});

console.log(backupContent);

fs.rmdirSync(repoDir, { recursive: true });