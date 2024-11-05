const platform = require("@nucleoidai/platform-express");
const { authorize } = require("@nucleoidai/platform-express/authorization");

const { authorization } = platform;

const app = platform.express();

app.use("/metrics", metrics);

app.use(authorization.verify);
app.use(authorize("ADMIN"));

// Add your routes here



module.exports = app;
