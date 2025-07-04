# JavaScript解析強化 実装計画

## 概要
互換性テストの結果から、JavaScript expression の解析能力を段階的に強化する必要があります。
対応が容易なケースから段階的に進めて、完全な互換性を目指します。

## 実装状況
- ✅ 基本的なJSX attribute (`class="..."`, `className="..."`)
- ✅ 単純なテンプレートリテラル (`` `class-names` ``)
- ✅ 単純な関数呼び出し (`classnames('class-names')`)
- ✅ 単純な配列構造 (`['class-names']`)
- ✅ 単純なオブジェクト構造 (`{'class-names': true}`)
- ⚠️ 複雑なテンプレートリテラル（修正機能が未実装）
- ❌ JavaScript expression内の複合構造
- ❌ クォート形式の統一
- ❌ prefixサポート
- ❌ カスタムクラス名の判定

## Phase 1: 基礎修正（容易） - 予想工数: 1-2日

### 1.1 クォート形式の統一 🟢
**問題**: `["border-x-0"]` vs `['border-x-0']`のクォート不一致
**対象ファイル**: `src/rules/enforces-shorthand.ts`
**実装方針**: ESLintのquote設定を取得してfix時に適用

```typescript
// TODO: Add quote style detection and application
function getQuoteStyle(context): 'single' | 'double' {
  // Get from ESLint config or default to single
}
```

### 1.2 複雑なテンプレートリテラルの修正機能実装 🟡
**問題**: 変数を含むテンプレートリテラルで修正が効かない
**現在**: エラー検出のみ、修正なし
**目標**: 静的部分のみ修正可能にする

```typescript
// Current: Reports error but no fix
// TODO: Implement complex template literal fix for static parts
```

### 1.3 重複テストケースの修正 🟢
**問題**: テストで重複エラーが発生
**対象ファイル**: `tests/compatibility/eslint-plugin-tailwindcss/enforces-shorthand.test.ts`
**実装方針**: 移植元のテストケースなので、重複している箇所をコメントアウトして対応

## Phase 2: 中級強化（中程度） - 予想工数: 3-4日

### 2.1 callees/tags設定のデフォルト化 🟡
**問題**: `classnames`や`ctl`が設定なしで動作しない
**実装方針**: よく使われる関数名をデフォルトに追加

```typescript
// TODO: Add common function names as defaults
const defaultCallees = ['classnames', 'clsx', 'ctl', 'cva'];
const defaultTags = ['tw', 'styled'];
```

### 2.2 JavaScript expression内での順序検出強化 🟡
**問題**: `mr-px ml-px ${ctl('mt-0 mb-0')}`で期待とは異なるエラーが出る
**実装方針**: expression全体を解析してクラス名の優先順位を考慮

### 2.3 ネストした構造の修正機能完全実装 🟡
**現在**: エラー検出のみ
**目標**: 配列・オブジェクト内のクラス名修正

## Phase 3: 高度な機能（困難） - 予想工数: 5-7日

### 3.1 Vue.js テンプレート対応 🔴
**問題**: `<template>` 構文でパーサーエラー
**実装方針**: Vue.js用のパーサー設定を追加

```typescript
// TODO: Add Vue.js template support
// Need to handle Vue.js specific syntax: :class, v-bind:class
```

### 3.2 prefix機能の実装 🔴
**問題**: `pfx-h-5 pfx-w-5`のようなprefixが未サポート
**実装方針**: Tailwind設定からprefix情報を取得

```typescript
// TODO: Extract prefix from Tailwind config
// Apply prefix-aware class name parsing
```

### 3.3 カスタムクラス名の判定機能 🔴
**問題**: `h-custom w-custom`を`size-custom`に変換してはいけないケース
**実装方針**: Tailwind設定を解析してクラス名の有効性をチェック

```typescript
// TODO: Implement Tailwind config parsing
// Check if custom class names exist in theme
interface TailwindConfig {
  theme?: {
    extend?: {
      spacing?: Record<string, string>;
      width?: Record<string, string>;
      height?: Record<string, string>;
      size?: Record<string, string>;
    }
  }
}
```

## Phase 4: エッジケース対応（最困難） - 予想工数: 3-5日

### 4.1 動的生成されるクラス名の処理 🔴
**問題**: `` myTag.subTag`class-names` ``, `myTag(Component)`class-names``
**実装方針**: より複雑なAST解析が必要

### 4.2 条件付きクラス名の高度な解析 🔴
**問題**: `` `${live && 'bg-white'} w-full px-10 py-10` ``
**実装方針**: 動的部分と静的部分の分離

### 4.3 スペース処理の改善 🟡
**問題**: Leading/trailing spaceの不適切な処理
**実装方針**: 文字列置換時のスペース保持

## 優先順位と実装順序

### 第1週: Phase 1（基礎修正）
1. ✅ 重複テストケース修正
2. ✅ クォート形式統一
3. ✅ 複雑テンプレートリテラル修正

### 第2週: Phase 2（中級強化）
1. ✅ callees/tagsデフォルト設定
2. ✅ JavaScript expression順序検出
3. ✅ ネスト構造修正完全実装

### 第3-4週: Phase 3（高度な機能）
1. ✅ カスタムクラス名判定（最重要）
2. ✅ prefix機能実装
3. ✅ Vue.js対応（必要に応じて）

### 第5週: Phase 4（エッジケース）
1. ✅ 動的生成クラス名
2. ✅ 条件付きクラス名
3. ✅ 最終的な互換性テスト

## 成功指標
- 互換性テストの成功率: 現在 62.7% (47/75) → 目標 95% (71/75)
- 特に重要な失敗ケース:
  - カスタムクラス名誤検出: 3件 → 0件
  - JavaScript expression未検出: 15件 → 2件以下
  - Vue.js対応: 4件 → 0件（対応する場合）

## 技術的な検討事項

### パフォーマンス
- 複雑なAST解析による処理速度への影響
- Tailwind設定ファイルの読み込み・キャッシュ戦略

### メンテナンス性
- テストケースの体系的な整理
- デバッグ用のログ出力機能

### 互換性
- ESLint 9.x との互換性維持
- TypeScript 5.x との互換性維持

---

## 開発メモ

### デバッグ用テスト作成
複雑なケースをデバッグするために、`tmp/`ディレクトリにテスト用ファイルを作成:

```bash
# Debug specific cases
npx tsx -e "
import rule from './src/rules/enforces-shorthand';
// Test specific patterns
"
```

### 段階的テスト実行
各フェーズ完了時に互換性テストを実行して進捗確認:

```bash
pnpm test:compatibility
```

### コード品質
- 各フェーズでコードレビューポイントを設定
- 単体テストの追加・更新
- TypeScript型安全性の確保
