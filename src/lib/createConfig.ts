import type { Template } from "./types";

type Env = "dev" | "land";

const configs = {
  link: {
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
          clientId:
            "613607639127-0fig8ok2bbm9mumju29hr534rorl3c2n.apps.googleusercontent.com",
          redirectUri: "http://localhost:5173/callback",
          scope: "https://www.googleapis.com/auth/userinfo.profile",
          response_type: "code",
          userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        },
      },
      land: {
        google: {
          authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
          clientId:
            "613607639127-0fig8ok2bbm9mumju29hr534rorl3c2n.apps.googleusercontent.com",
          redirectUri: "http://localhost:5173/callback",
          scope: "https://www.googleapis.com/auth/userinfo.profile",
          response_type: "code",
          userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        },
      },
    },
  },
  "link-express": {
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
} as const;

const ENV_MAP: Record<string, Env> = {
  "config.js":      "dev",
  "config.land.js": "land",
  "config.live.js": "land",
};

export function createConfig(template: Template, file?: string): Record<string, unknown> {
  if (template === "link") {
    const base: Record<string, unknown> = { ...configs.link.base };

    if (file && file.startsWith("config")) {
      const env = ENV_MAP[file];
      if (env) base.project = configs.link.environments[env];
    }

    return base;
  }

  if (template === "link-express") {
    return configs["link-express"];
  }

  return {};
}
