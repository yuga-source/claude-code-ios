# チーム負荷管理ツール (team-workload)

グループメンバーの**業務負荷状況**を可視化するタスク管理ツール。

複数の業務サイト（業務サイトA/B/C…）に分散した業務日程を1つに集約し、
管理者がメンバー全体の負荷を俯瞰できるようにする。突発業務は各自が手入力でき、
サイト由来のタスクはCSV取込で再入力なし（2度手間防止）で取り込む。

## 主な機能

- **管理者の負荷ダッシュボード** (`/dashboard`) — メンバーを負荷の高い順に表示。
  負荷レベル（余裕 / 普通 / 高 / 逼迫）と、件数・工数・締切・主観の内訳バー。
- **マイタスク** (`/tasks`) — 自分のタスク管理、突発業務の追加、負荷感の自己申告。
- **CSV取込** (`/import`) — 各サイトのエクスポートCSVを取込。`external_id` で
  重複せず upsert（再取込しても二重登録されない）。

## 負荷スコア

`src/lib/workload/score.ts` で4指標を合成（係数は `config.ts` で調整可）:

| 指標 | 説明 | 既定の重み |
|------|------|-----------|
| 件数 | 未完了タスク数 | 0.30 |
| 工数 | 見積もり工数(h)合計 | 0.30 |
| 締切 | 締切の集中度（締切が近いほど高重み） | 0.20 |
| 主観 | 本人の自己申告（余裕/普通/逼迫） | 0.20 |

スコア(0..1)を 余裕 / 普通 / 高 / 逼迫 の4段階に分類。

## 技術スタック

Next.js 15 (App Router) / TypeScript / Prisma / SQLite / Tailwind CSS / Auth.js v5。
社内サーバーへのデプロイ時は SQLite → PostgreSQL へ移行可（`schema.prisma` の
`datasource` を変更）。

## セットアップ

```bash
# 1. 依存インストール（要: npm レジストリへのネットワークアクセス）
npm install

# 2. 環境変数
cp .env.example .env   # 必要なら AUTH_SECRET を openssl rand -base64 32 で更新

# 3. DB 作成 + シード
npx prisma migrate dev --name init
npm run db:seed

# 4. 起動
npm run dev            # http://localhost:3000
```

### デモアカウント（パスワードは全て `password`）

- 管理者: `manager@example.com`
- メンバー: `member1@example.com` 〜 `member4@example.com`
  - member1（田中）は意図的に高負荷（逼迫）になるようシード済み。

## テスト

```bash
npm test     # 負荷スコアの単体テスト (vitest)
```

## サイト連携の拡張

`src/lib/import/types.ts` の `ImportAdapter` を実装すれば新しい取込元を追加できる。
CSV (`csvAdapter.ts`) が最初の実装。将来、社内サーバー上のサイトAPI/DBを直接読む
アダプタを追加しても、検証・重複防止・スコアリング（`pipeline.ts` 以降）は不変。

## 動作確認の流れ

1. `manager@example.com` でログイン → `/dashboard` で田中が「逼迫(赤)」最上位を確認。
2. `/import` で `sample-data/site-a-tasks.csv` を取込 → 新規/更新件数を確認。
   同じファイルを再取込し、**重複せず更新される**ことを確認（2度手間防止）。
3. `member1@example.com` でログイン → `/tasks` で突発タスク追加・負荷感変更 →
   管理者ダッシュボードに反映を確認。
