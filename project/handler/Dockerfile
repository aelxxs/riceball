FROM node:18

WORKDIR /handler

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

CMD yarn start