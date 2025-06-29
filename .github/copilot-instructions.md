# GitHub Copilot Instructions

- 応答は日本語で行ってください。
- コードの説明は英語で書いてください。
- コードのコメントは英語で書いてください。
- テストは二種類あります。
  - 単体テスト: `pnpm test:unit`
  - 互換性テスト: `pnpm test:compatibility`
- コードスニペットを実行するときは `npx tsx -e` を使用してください。
- デバッグコードは`tmp/` ディレクトリに作成してください。
