const config = {
  appId: "{{appId}}",
  name: "{{projectName}}",
  base: "/",
  api: "",
  oauth: {
    github: {
      redirectUri: "https://nuc.land/callback/greycollar",
      authUrl: "https://github.com/login/oauth/authorize",
      userUrl: "https://api.github.com/user",
      clientId: "c391f0f4f1ad600a20ef",
      scope: "user",
      response_type: "code",
    },
  },
};

export default config;
