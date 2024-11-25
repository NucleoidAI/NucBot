<h1 align="center">NucBot</h1>

<p align="center">
  <a href="https://www.apache.org/licenses/LICENSE-2.0">
    <img src="https://img.shields.io/badge/Apache-2.0-yellow?style=for-the-badge&logo=apache" alt="License" />
  </a>
  <a href="https://www.npmjs.com/package/nucleoidjs">
    <img src="https://img.shields.io/badge/NPM-red?style=for-the-badge&logo=npm" alt="NPM" />
  </a>
  <a href="https://discord.com/invite/eWXFCCuU5y">
    <img src="https://img.shields.io/badge/Discord-lightgrey?style=for-the-badge&logo=discord" alt="Discord" />
  </a>
</p>

![Banner](.github/media/banner.gif)

<p align="center">
  01010111 01101101 01011001 00111110
</p>

<br/>

## Installation

```bash
npm install -g nucbot
```

## Usage

### Initialize a New Project

The `init` command helps you create a new NucBot project. There are two ways to use it:

1. Interactive Mode:
```bash
nucbot init
```
This will start an interactive prompt to guide you through project creation.

2. Direct Mode:
```bash
nucbot init -platform <platform> -name <project-name>
```

Options:
- `-p, --platform`: Choose a project type. (`platform`, `platform-express`)
- `-n, --name`: Set your project name

Example:
```bash
nucbot init --platform platform --name deneme      
```

### Update Project Components

To update your existing project's components and dependencies:

```bash
nucbot update
```

This command will:
- Update all project configuration to their latest versions
- Maintain compatibility with your current configuration

Note: Make sure you're in your project's root directory when running the update command.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
