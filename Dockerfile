# ---- Build Stage ----
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .

# Vite bakes VITE_* vars into the client bundle at build time, so they must be
# passed in as Docker build args (set these in Dokploy's "Build Arguments").
# A runtime-only env var here is invisible to `vite build` and ships as
# `undefined` in the browser bundle forever.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

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