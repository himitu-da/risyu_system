This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Release Note
## v0.1 2025/02/28
初バージョン作成

## v0.1.1 2025/03/02
サーバーに保存できない問題を修正

## v0.2 2025/03/02
同期用IDおよび共有用IDを用意し、別端末で同期できるように
サーバーから復元をするときに同期用IDを入力させる

## v0.2.1 2025/03/02
初回の同期が行われるまでは同期用IDが発行されないようになり、初回の同期が行われてから初めて、同期用IDを発行するように
サーバーから復元ではなくサーバーから読み込みに名称を変更
サーバーから読み込みをした場合、同期用IDを、その読み込む際に入力した同期用IDに置き換えるように

## v0.2.1.1 2025/03/02
同期用IDがない状態で、サーバーから読み込みをした際に、同期用ID項目がデータ管理セクションにすぐに出ない問題を修正

## v0.3 2025/03/03
単位数1～4をグリッドで指定できるように（1×4のグリッドで、1～4の整数が左から右にかけて大きくなる）
曜日（月～金）と時限（1～5）をグリッドで指定できるように（5×5のグリッドで、1列目は月、2列目は火、1行目は1限、2行目は2限になるように）
UIの改善（エラー表示、時間割表）
科目追加をトグルにして開閉できるように

## v0.4
授業追加において、選択の時間割に既存の科目が存在する場合は追加できなくする（追加したい場合は削除する必要がある表示する）
複数の時限がある科目にも対応できるように


## v0.5
新たに共有用ＩＤというものを追加し、こちらも表示/コピーできるようにする
自然言語入力で、コピペで自動的に履修の登録ができるように
・現在はサーバーに保存/サーバーから復元の2つの項目しかないが、次のようにする
→保存（同期用IDに相当するサーバーに保存）/同期・復元（同期用IDから閲覧）/閲覧
URLおよびQRコードから同期ができるように。共有もできる

## 追加したいもの
・各履修科目に評価を付けることができるようにする
・GPA計算機能
・同期用リンクおよび共有用リンクの作成
・課金機能（自動同期や他人への共有は年間100円）