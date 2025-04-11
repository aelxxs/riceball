FROM node:22-alpine AS base

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
    RUN turbo prune handler --docker

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

    RUN pnpm turbo build

# ================= #
#   Runner Stage    #
# ================= #

FROM base AS runner

    WORKDIR /riceball

    RUN addgroup --system --gid 1001 riceball
    RUN adduser --system --uid 1001 riceball

    USER riceball

    COPY --from=installer /riceball .

    CMD ["node", "project/handler/dist"]