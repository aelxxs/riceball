FROM node:19

RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm

# COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY package.json .

RUN pnpm install

COPY . .
COPY ../db db

RUN pnpm prisma generate

RUN pnpm build
CMD pnpm start
