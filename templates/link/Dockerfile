FROM oven/bun:1-alpine

WORKDIR /app

COPY ./dist ./dist
COPY config.js config.mjs

EXPOSE 3000

ENTRYPOINT ["bunx", "@nucleoidjs/http-server", "start"]
