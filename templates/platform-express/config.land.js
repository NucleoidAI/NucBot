const config = {
  postgres: {
    debug: true,
    sync: true,
  },
  dynamodb: {
    region: "us-east-1",
  }
  {{project}}
};

module.exports = config;
