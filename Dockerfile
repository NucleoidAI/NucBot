FROM oven/bun:1-alpine

# docker CLI + compose plugin — needed by `watcher` to manage other services via socket
RUN apk add --no-cache docker-cli docker-cli-compose

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY . .

ENTRYPOINT ["bun", "src/cli.ts"]
