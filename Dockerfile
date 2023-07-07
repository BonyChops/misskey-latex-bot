FROM node:16-slim as builder

# アプリケーションディレクトリを作成する
WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

RUN npm run build

FROM node:16-slim

COPY --from=builder /app/dist /

EXPOSE 8080
CMD [ "node", "server.js" ]