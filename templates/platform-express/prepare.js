const fs = require("fs");

fs.writeFileSync(
  `${__dirname}/.git/hooks/pre-commit`,
  `#!/bin/bash
        npm run lint`
);