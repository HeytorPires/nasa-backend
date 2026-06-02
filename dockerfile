
#Primeiro instala depednencias e builda a aplicação
#depois copia apenas os arquivos necessários para rodar a aplicação em produção
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

#Rodando a aplicação em produção, copiando apenas os arquivos necessários do estágio anterior
FROM node:24-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]