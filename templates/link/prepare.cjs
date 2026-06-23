const fs = require("fs");

const prePush = `#!/usr/bin/env node
const { execSync } = require("child_process");

try {
  execSync("bun run lint");
  execSync("bun test");
} catch (err) {
  console.log(err.stdout.toString());
  process.exit(1);
}
`;

fs.writeFileSync(`${__dirname}/.git/hooks/pre-push`, prePush);
