const platform = require("@nucleoidai/platform-express");
const { authorize } = require("@nucleoidai/platform-express/authorization");

const { authorization, express } = platform;

const app = express();

app.use(authorization.verify);
app.use(authorize("ADMIN"));

// Add your routes here

module.exports = app;
