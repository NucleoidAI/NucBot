const fs = require("fs");

fs.writeFileSync(
  `${__dirname}/.git/hooks/pre-commit`,
  `#!/bin/bash
        bun run lint`
);