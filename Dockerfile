FROM node:16-slim as builder

# アプリケーションディレクトリを作成する
WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

RUN npm run build

FROM node:16-slim

WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/dist /app/dist
RUN npm install --production


EXPOSE 8080
CMD [ "node", "dist/server.js" ]