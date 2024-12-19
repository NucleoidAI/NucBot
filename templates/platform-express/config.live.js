const config = {
  postgres: {
    debug: true,
    sync: false,
  },
  dynamodb: {
    region: "us-east-1",
  }
  {{project}}
};

module.exports = config;
