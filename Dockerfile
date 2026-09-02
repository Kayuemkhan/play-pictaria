# ---- Build Stage ----
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .

# Override the default cloudflare preset to node-server for Dokploy
ENV NITRO_PRESET=node-server
RUN bun run build

# ---- Run Stage ----
FROM oven/bun:1-slim AS runner
WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]