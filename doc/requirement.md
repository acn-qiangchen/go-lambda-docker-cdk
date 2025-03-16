# Lambda Function CI/CD Pipeline Project

## 概要
本プロジェクトは、AWS Lambda関数のCI/CDパイプラインを実装するためのPoC（Proof of Concept）です。
Dockerコンテナを活用したLambda関数のビルド、デプロイメントを自動化し、インフラストラクチャをコードとして管理します。

## アーキテクチャ

### インフラストラクチャ構成
- AWS CDKを使用したインフラストラクチャのコード化
- 以下のAWSリソースを作成・管理
  - VPC（プライベートサブネット、パブリックサブネット）
  - IAMロール・ポリシー
  - Amazon ECR（コンテナレジストリ）
  - AWS Lambda関数
  - セキュリティグループ

### CI/CDパイプライン
#### CI（継続的インテグレーション）
- 各Lambda関数のソースコードをDockerイメージとしてビルド
- ビルドされたDockerイメージをAmazon ECRにプッシュ
- 1つのLambda関数に対して1つのDockerイメージを管理

#### CD（継続的デリバリー）
- ECRに格納されたDockerイメージを使用してLambda関数をデプロイ
- デプロイメントパラメータと環境変数は設定ファイルで一元管理
- 環境別（開発/本番）の設定管理をサポート

## プロジェクト構成

### ディレクトリ構造
```
.
├── .github/workflows/    # GitHub Actions ワークフロー定義
├── cdk/                  # AWS CDKコード
│   ├── bin/             # CDKアプリケーションのエントリーポイント
│   ├── lib/             # インフラストラクチャスタック定義
│   └── config.*.json    # 環境別設定ファイル
├── lambda/              # Lambda関数のソースコード
└── scripts/             # ユーティリティスクリプト
```

### デプロイメントワークフロー
1. インフラストラクチャのデプロイ
   - VPCスタックのデプロイ
   - IAMスタックのデプロイ
   - ECRリポジトリの作成

2. アプリケーションのデプロイ
   - Dockerイメージのビルドとプッシュ
   - Lambda関数のデプロイ

## 注意事項
- 本プロジェクトはPoCとして実装されており、実環境での利用時には以下の調整が必要
  - VPC設定の環境別パラメータ化
  - IAMロールとポリシーの調整
  - セキュリティ要件に応じたネットワーク設定の見直し
  - 監視・ロギング設定の追加

## 技術スタック
- AWS CDK (TypeScript)
- AWS Lambda
- Docker
- GitHub Actions
- Go (Lambda関数の実装言語) 