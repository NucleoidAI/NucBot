const createConfig = (template, file) => {
  const configs = {
    platform: {
      base: {
        login: {
          variant: "modern",
          image: "https://minimals.cc/assets/background/overlay_3.jpg",
          icon: "https://cdn.nucleoid.com/media/icon.png",
          largeIcon: "https://cdn.nucleoid.com/media/icon.png",
        },
        projectBar: {
          label: "Project",
        },
      },
      environments: {
        dev: {
          github: {
            authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            clientId: "613607639127-0fig8ok2bbm9mumju29hr534rorl3c2n.apps.googleusercontent.com",
            redirectUri: "http://localhost:5173/callback",
            scope: "https://www.googleapis.com/auth/userinfo.profile",
            response_type: "code",
            userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
          },
        },
        land: {
          google: {
            authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            clientId: "613607639127-0fig8ok2bbm9mumju29hr534rorl3c2n.apps.googleusercontent.com",
            redirectUri: "http://localhost:5173/callback",
            scope: "https://www.googleapis.com/auth/userinfo.profile",
            response_type: "code",
            userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
          },
        },
      },
    },
    "platform-express": {
      project: {
        label: "Team",
        jwt: {
          identifier: "id",
        },
        oauth: {
          tokenUrl: "https://github.com/login/oauth/access_token",
          userUrl: "https://api.github.com/user",
          clientId: "0c2844d3d19dc9293fc5",
        },
      },
    },
  };

  const getEnvironmentFromFile = (filename) => {
    const environmentMap = {
      "config.js": "dev",
      "config.land.js": "land",
      "config.live.js": "land",
    };
    return environmentMap[filename];
  };

  if (template === "platform") {
    const baseConfig = {
      ...configs.platform.base,
    };

    if (file && file.startsWith("config")) {
      const env = getEnvironmentFromFile(file);
      if (env) {
        baseConfig.project = configs.platform.environments[env];
      }
    }

    return baseConfig;
  }

  if (template === "platform-express") {
    return configs["platform-express"];
  }

  return {};
};

module.exports = createConfig;