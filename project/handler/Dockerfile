FROM node:18

COPY package.json .

RUN yarn install

COPY . .

RUN yarn build
CMD yarn start