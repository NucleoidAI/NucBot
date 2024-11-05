const { name: title, version } = require("../package.json");
const platform = require("@nucleoidai/platform-express");
const swaggerJsdoc = platform.require("swagger-jsdoc");
const j2s = platform.require("joi-to-swagger");
const schemas = require("./schemas");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title, version },
  },
  apis: ["./src/routes/*.js"],
});

swaggerSpec.components = {
  schemas: {},
};

for (const schema in schemas) {
  const { swagger } = j2s(schemas[schema]);
  swaggerSpec.components.schemas[schema] = swagger;
}

module.exports = swaggerSpec;
