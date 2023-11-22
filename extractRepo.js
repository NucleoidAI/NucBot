const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os'); 

execSync(`git clone https://github.com/NucleoidJS/Nucleoid`);

function readDirR(dir) {
    return fs.statSync(dir).isDirectory()
        ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f))))
        : dir;
}

let files = readDirR('Nucleoid');

let backupContent = '';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    backupContent += `# ${file}\n${content}\n`;
});

console.log(backupContent);

if (os.platform() === 'win32') {
    execSync(`rmdir /s /q Nucleoid`);
} else {
    execSync(`rm -Rf Nucleoid`);
}
