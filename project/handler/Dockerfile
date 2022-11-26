FROM node:19

COPY package.json .

RUN yarn install

COPY . .

RUN yarn build
CMD yarn start