FROM node:20-bookworm-slim AS deps
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM node:20-bookworm-slim AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY tools ./tools
COPY src ./src
RUN pnpm run build || true

FROM node:20-bookworm-slim AS runner
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_CONFIG_PRODUCTION=false
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
COPY server.ts ./
COPY --from=builder /app/dist ./dist
# Ensure log directory exists and is writable by node user
RUN mkdir -p /app/logs && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["node","-r","ts-node/register/transpile-only","-r","tsconfig-paths/register","server.ts"] 