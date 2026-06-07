# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う際に Claude Code (claude.ai/code) へ指示を与えるためのものです。

## プロジェクト概要

iPhoneだけで Claude Code を使うことを探求するプロジェクト。  
現在は **TankaCalc（単価計算）** という iOS アプリを開発中。

- 購入品の1個（100g / 100ml）あたりの単価を計算する
- お気に入り登録（商品名・店・価格・量・単価）
- バーコードスキャンで楽天市場の価格と比較する

## 技術スタック

- **言語**: Swift 5.9
- **UI**: SwiftUI
- **データ永続化**: SwiftData (iOS 17+)
- **バーコードスキャン**: AVFoundation
- **外部 API**: 楽天市場商品検索 API
- **プロジェクト生成**: XcodeGen (`project.yml`)

## ビルド方法

### 前提条件

- Xcode 15 以上（macOS）
- XcodeGen のインストール: `brew install xcodegen`
- 楽天 Web Service の Application ID（無料）: https://webservice.rakuten.co.jp/

### セットアップ

```bash
# .xcodeproj を生成する
xcodegen generate

# Xcode で開く
open TankaCalc.xcodeproj
```

### 楽天 API キーの設定

Xcode の「Product > Scheme > Edit Scheme > Run > Arguments > Environment Variables」で設定する:

```
RAKUTEN_APP_ID = <取得した Application ID>
```

または `xcconfig` ファイルを使う（Git にコミットしないこと）。

## ディレクトリ構成

```
TankaCalc/
├── App/
│   └── TankaCalcApp.swift        # エントリーポイント、SwiftData コンテナ設定
├── Models/
│   ├── FavoriteItem.swift        # SwiftData モデル（お気に入り）
│   ├── MeasurementUnit.swift     # 単位 enum（g/kg/ml/L/個 など）と単価計算ロジック
│   └── PriceResult.swift        # API レスポンス型
├── Views/
│   ├── ContentView.swift         # タブバー（計算/お気に入り/スキャン）
│   ├── CalculatorView.swift      # 単価計算 + お気に入り保存シート
│   ├── FavoritesView.swift       # お気に入り一覧（検索・並び替え・削除）
│   ├── FavoriteDetailView.swift  # お気に入り詳細・編集
│   ├── BarcodeScannerView.swift  # カメラ + AVFoundation バーコードスキャナー
│   ├── CameraPreview.swift       # AVCaptureSession の UIViewRepresentable ラッパー
│   └── PriceComparisonView.swift # 楽天 API 検索結果・Amazon リンク表示
└── Services/
    └── RakutenAPIService.swift   # 楽天市場商品検索 API クライアント（actor）
```

## アーキテクチャの要点

### 単価計算ロジック

`MeasurementUnit.unitPrice(price:quantity:)` が一元管理する。重量系は 100g あたり、容量系は 100ml あたり、個数系は 1個あたりに正規化する。`FavoriteItem` は保存時に計算済みの値（`unitPrice`, `unitPriceBase`）をキャッシュする。

### バーコードスキャナー

`BarcodeScanner`（`@MainActor` + `ObservableObject`）が AVFoundation セッションを管理する。スキャン成功 → `pause()` → 比較シート表示 → シートを閉じると `resume()` の流れ。

### 価格比較

バーコード（JAN コード）をそのままキーワードとして楽天 API を叩く。Amazon は公式 PA-API の制約（アフィリエイト審査が必要）のため、Safari で検索 URL を開く形で実装している。比較シート内でキーワードを変更して再検索できる。

### SwiftData

`@Model` は `FavoriteItem` のみ。`modelContainer` は `TankaCalcApp` のシーンで一括設定し、各 View は `@Environment(\.modelContext)` で受け取る。
