export type CommandHandler = (args: string[]) => Promise<void> | void;

export type Template = "link" | "link-express";

export type LoginConfig = { enabled: boolean };

export type ProjectConfig = {
  name: string;
  type: Template;
  login: LoginConfig;
};
