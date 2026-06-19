<h1 align="center">NucBot</h1>

<p align="center">
  <a href="https://www.apache.org/licenses/LICENSE-2.0">
    <img src="https://img.shields.io/badge/Apache-2.0-yellow?style=for-the-badge&logo=apache" alt="License" />
  </a>
  <a href="https://www.npmjs.com/package/nucbot">
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
bun install -g nucbot
```

## Usage

### Initialize a New Project

The `init` command helps you create a new NucBot project. There are two ways to use it:

1. Interactive mode:
```bash
nucbot init
```

2. Direct mode:
```bash
nucbot init --template <template> --name <project-name>
```

Options:
- `-t, --template`: Template type (`link`, `link-express`)
- `-n, --name`: Project name
- `--login`: Include authentication/login functionality

Example:
```bash
nucbot init --template link --name nucleoid_app
```

### Watcher — docker-compose redeploy server

Listens for authenticated POSTs on `/<service>` and runs `docker compose pull` + `up -d` for that service.

```bash
nucbot watcher --file ./docker-compose.yml --token $NUCBOT_TOKEN
```

### Bridge — Trello ↔ Slack

Opens a Slack thread when a card moves to *In Progress*, posts the PR link when it moves to *In Review*, sends staleness warnings and a daily EOD report.

```bash
nucbot bridge --setup    # one-time webhook registration
nucbot bridge            # run the bridge
```

Required env: `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`, `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`.
See `nucbot --help` for all options.

## Development

Built with [Bun](https://bun.com) + TypeScript.

```bash
bun install
bun run dev init            # run CLI from source
bun run lint                # type-check
bun run build               # cross-platform binaries → dist/
bun run build:local         # local binary → dist/nucbot
```

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
