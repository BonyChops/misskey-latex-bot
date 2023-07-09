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

#フォントのインストール
RUN apt update &&\
    apt install -y wget &&\
    apt install -y zip unzip &&\
    apt install -y fontconfig
RUN wget https://moji.or.jp/wp-content/ipafont/IPAexfont/IPAexfont00301.zip
RUN unzip IPAexfont00301.zip
RUN mkdir -p /usr/share/fonts/ipa
RUN cp IPAexfont00301/*.ttf /usr/share/fonts/ipa
RUN fc-cache -fv
RUN apt autoremove -y wget zip unzip &&\
    apt clean

EXPOSE 8080
CMD [ "node", "dist/server.js" ]