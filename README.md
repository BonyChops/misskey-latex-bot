# misskey-latex-bot

MisskeyでLaTeX表記の画像を返します

## 使い方

### 設定

1. bot用アカウントを作成
1. 設定から[API] -> アクセストークンを作成し、のちの`MISSKEY_TOKEN`に設定
1. 設定から[Webhook] -> Webhookを作成し、接続先を`バックエンドの接続先/generate`(例: `https://xxx-misskey-latex-bot.a.run.app/generate`)とする。タイミングは、「返信されたとき」「メンションされたとき」

### バックエンドの起動

以下の環境変数を`.env`に作成してください。

|                       |                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------- |
| `MISSKEY_HOST`        | Misskeyのホスト名。misskey.nnct18j.comであれば`https://misskey.nnct18j.com`を指定。 |
| `MISSKEY_TOKEN`       | Misskey APIを使用するためのAPIキー                                                  |
| `MISSKEY_HOOK_SECRET` | Misskey Webhookのシークレットを設定                                                 |
| `BOTNAME`             | ボット名。@latexbotであれば`latexbot`と指定。                                       |

```.env
MISSKEY_HOST=
MISSKEY_TOKEN=
MISSKEY_HOOK_SECRET=
BOTNAME=
```

#### 開発/おためし

```shell
npm i
npm run dev
```

#### 起動(Dockerあり)

```shell
docker build -t misskey-latex-bot .
docker run --env-file .env  -it -p 8080:8080 misskey-latex-bot
```

#### 起動(Dockerなし)

```shell
npm i
npm run build
rm -r node_modules # 任意: 軽量化
npm i --production # 任意: 軽量化
npm run start
```

#### Cloud Run

Cloud Runに直接あげることもできます。上記に示した環境変数を指定した上で、デプロイしてください。
