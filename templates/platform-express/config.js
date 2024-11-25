const config = {
  oauth: {
    jwt: {
      identifier: "id",
    },
    tokenUrl: "https://github.com/login/oauth/access_token",
    userUrl: "https://api.github.com/user",
    clientId: "0c2844d3d19dc9293fc5",
  },
  link: {
    project: {
      label: "Project",
    },
  },
  postgres: {
    uri: "sqlite::memory:",
    debug: true,
    sync: true,
  },
  dynamodb: {
    region: "us-east-1",
  },
};

module.exports = config;
