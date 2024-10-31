const generateConfigs = (projectName, appId) => ({
    dev: `const config = {
    appId: "${appId}",
    name: "${projectName}",
    base: "/",
    api: "http://localhost:3000",
    oauth: {
      github: {
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "0c2844d3d19dc9293fc5",
        redirectUri: "http://localhost:5173/callback",
        userUrl: "https://api.github.com/user",
        scope: "user",
        response_type: "code",
      },
    },
  };
  
  export default config;
  `,
    land: `const config = {
    appId: "${appId}",
    name: "${projectName}",
    base: "/",
    api: "",
    oauth: {
      github: {
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "0c2844d3d19dc9293fc5",
        redirectUri: "http://localhost:5173/callback",
        userUrl: "https://api.github.com/user",
        scope: "user",
        response_type: "code",
      },
    },
  };
  
  export default config;
  `,
    live: `const config = {
    appId: "${appId}",
    name: "${projectName}",
    base: "/",
    api: "",
    oauth: {
      github: {
        authUrl: "https://github.com/login/oauth/authorize",
        clientId: "0c2844d3d19dc9293fc5",
        redirectUri: "http://localhost:5173/callback",
        userUrl: "https://api.github.com/user",
        scope: "user",
        response_type: "code",
      },
    },
  };
  
  export default config;
  `
  });

  module.exports = generateConfigs;