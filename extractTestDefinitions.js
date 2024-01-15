const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const execSync = require("child_process").execSync;

const tempDir = os.tmpdir();
const folderId = uuidv4();
const repoDir = path.join(tempDir, folderId);

execSync(`git clone https://github.com/NucleoidJS/Nucleoid ${repoDir}`);

const specFilePath = path.join(repoDir, "src", "test", "nucleoid.spec.js");

const testData = fs.readFileSync(specFilePath, "utf8");
function extractTestDescriptions(testData) {
  const describeRegex = /describe\((['"`])(.*?)\1,/g;
  const itRegex = /it\((['"`])(.*?)\1,/g;

  let currentDescribe = "";
  let output = "";
  let definitionBlock = "";
  let previousItDescription = "";

  for (const line of testData.split("\n")) {
    const describeMatch = describeRegex.exec(line);
    const itMatch = itRegex.exec(line);

    if (describeMatch) {
      currentDescribe = describeMatch[2];
      definitionBlock = "";
    } else if (itMatch) {
      if (previousItDescription) {
        let blockLines = definitionBlock.split("\n");
        blockLines.pop();
        blockLines.pop();
        blockLines.pop();

        const trimmedDefinitionBlock = blockLines.join("\n");

        output += `Nucleoid ${currentDescribe} ${previousItDescription}\n${trimmedDefinitionBlock}\n\n`;
        definitionBlock = "";
      }
      previousItDescription = itMatch[2];
    } else {
      definitionBlock += line + "\n";
    }
  }

  if (previousItDescription) {
    let blockLines = definitionBlock.split("\n");
    for (let i = 0; i < 5; i++) {
      blockLines.pop();
    }

    const trimmedDefinitionBlock = blockLines.join("\n");

    output += `Nucleoid ${currentDescribe} ${previousItDescription}\n${trimmedDefinitionBlock}\n`;
  }

  return output;
}

const formattedDescriptions = extractTestDescriptions(testData);

fs.writeFileSync("output.txt", formattedDescriptions);
