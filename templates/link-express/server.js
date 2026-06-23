const platform = require("@nucleoidai/platform-express");
const models = require("./src/models");
const config = require("./config");

platform.init(config).then(() => models.init());

const app = require("./src/app");
app.listen(process.env.PORT || 3000);
