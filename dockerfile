FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
