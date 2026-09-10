FROM node:20-alpine AS base
WORKDIR /app

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
# Next.js expects a public/ dir to exist even if it's empty
RUN mkdir -p public

# Build-time-only placeholders — `prisma generate` and `next build` only need
# these env vars to be present/parseable, not to connect to anything real.
# The actual values are injected at container run time (see docker-compose.yml).
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV AUTH_SECRET="build-time-placeholder"
ENV GOOGLE_CLIENT_ID="build-time-placeholder"
ENV GOOGLE_CLIENT_SECRET="build-time-placeholder"

# Generate the Prisma client (custom output: lib/generated/prisma)
RUN pnpm db:generate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only what we need to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib/generated ./lib/generated

EXPOSE 3000
CMD ["pnpm", "start"]
