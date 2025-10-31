FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ================= #
#   Builder Stage   #
# ================= #

FROM base AS builder

    WORKDIR /riceball

    RUN apk update
    RUN apk add --no-cache libc6-compat

    RUN pnpm add -g turbo
    COPY . .
    RUN turbo prune website --docker

# ================= #
#  Installer Stage  #
# ================= #

FROM base AS installer

    WORKDIR /riceball

    RUN apk update
    RUN apk add --no-cache libc6-compat

    COPY --from=builder /riceball/out/json/ .
    RUN pnpm install --frozen-lockfile
    COPY --from=builder /riceball/out/full/ .

    RUN pnpm run build

# ================= #
#   Runner Stage    #
# ================= #

FROM base AS runner

    WORKDIR /riceball

    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 svelte

    USER svelte

    COPY --chown=svelte:nodejs --from=installer /riceball .

    ENV NODE_ENV=production
    ENV PORT=3000
    EXPOSE $PORT

    CMD ["node", "/riceball/project/website/build"]