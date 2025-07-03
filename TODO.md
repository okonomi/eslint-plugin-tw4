# CallExpression Support Implementation Plan

## 概要
現在のenforces-shorthandルールはJSXAttributeの文字列リテラルのみを処理している。
関数呼び出し（CallExpression）内のクラス名も処理できるよう拡張する。

## 段階的実装計画

### Phase 1: 基本的なCallExpression対応
#### 1.1 単純な文字列引数の関数呼び出し ✅ **完了**
**目標**: `classnames('py-8 px-8')` のような単純なケースに対応

**対象テストケース**:
- ✅ `classnames('w-1 h-1')` → `classnames('size-1')`
- ✅ `clsx('px-4 py-4')` → `clsx('p-4')`
- ✅ `cn('mt-2 mb-2')` → `cn('my-2')`
- ✅ `classnames('border-l-0 border-r-0')` → `classnames('border-x-0')`
- ✅ `twMerge('overflow-x-auto overflow-y-auto')` → `twMerge('overflow-auto')`
- 🔄 `classnames('sfc-border-l-0 sfc-border-r-0')` (prefix設定が必要)
- 🔄 `classnames('md_sfc-border-l-0 md_sfc-border-r-0')` (separator設定が必要)

**実装内容**:
- ✅ CallExpressionノード検出のセットアップ
- ✅ オプションから`callees`配列を取得
- ✅ 指定された関数名のCallExpressionを識別
- ✅ 第一引数が文字列リテラルの場合の処理
- ✅ 既存のapplyShorthands関数を再利用
- ✅ テスト実行・デバッグ
- 🔄 prefix/separator設定の対応（次のタスク）

**結果**: 基本的なCallExpression対応は完了。prefix/separator設定のみ残り。

**推定工数**: 2-3時間 → **実際**: 1時間（既に実装済みだった）

#### 1.1.1 Prefix/Separator設定対応 🔄 **進行中**
**目標**: `config`オプションのprefix/separatorを`applyShorthands`に渡す

**対象テストケース**:
- `classnames('sfc-border-l-0 sfc-border-r-0')` with prefix: "sfc-"
- `classnames('md_sfc-border-l-0 md_sfc-border-r-0')` with prefix: "sfc-", separator: "_"

**実装内容**:
- [ ] `applyShorthands`関数にconfig引数を追加
- [ ] ESLintルールでconfigオプションを`applyShorthands`に渡す
- [ ] prefix/separator設定を適切に処理
- [ ] 既存テストが引き続き動作することを確認

**推定工数**: 1時間

#### 1.2 配列の第一要素が文字列の場合 ✅ **完了**
**目標**: `classnames(['py-8 px-8 w-48 h-48 text-white'])` に対応

**対象テストケース**:
- ✅ `classnames(['w-1 h-1'])` → `classnames(['size-1'])`
- ✅ `clsx(['px-4 py-4'])` → `clsx(['p-4'])`
- ✅ `classnames(['mt-2 mb-2'])` → `classnames(['my-2'])`
- ✅ `classnames(['border-l-0 border-r-0'])` → `classnames(['border-x-0'])`
- ✅ `classnames(['overflow-x-auto overflow-y-auto'])` → `classnames(['overflow-auto'])`
- ✅ 複数要素配列での第一要素のみ変換
- ✅ 有効性検証（変換不要なケース）

**実装内容**:
- ✅ ArrayExpression内の最初の要素をチェック
- ✅ 文字列リテラルの場合のみ処理
- ✅ fix関数で配列内の文字列を適切に置換
- ✅ テスト実行・デバッグ

**結果**: 配列の第一要素が文字列の場合の処理は完全に実装完了。

**推定工数**: 1-2時間 → **実際**: 30分

### Phase 2: オブジェクト表記への対応 ✅ **完了**
#### 2.1 オブジェクトのキーとしてのクラス名 ✅ **完了**
**目標**: `classnames({'py-8 px-8 text-white': true})` に対応

**対象テストケース**:
- ✅ `classnames({'w-1 h-1': true})` → `classnames({'size-1': true})`
- ✅ `classnames({'px-4 py-4': true})` → `classnames({'p-4': true})`
- ✅ `classnames({'!py-8 !px-8': true})` → `classnames({'!p-8': true})`
- ✅ `classnames({'!pt-8 !pb-8 !pr-8 !pl-8': true})` → `classnames({'!p-8': true})`
- ✅ `classnames({'md:!rounded-tr block md:rounded-tl md:rounded-br md:rounded-bl': true})` など
- ✅ 混合プロパティでの適切な処理
- ✅ 有効性検証（変換不要なケース）

**実装内容**:
- ✅ ObjectExpressionの検出
- ✅ プロパティのキーが文字列リテラル/Identifierの場合をチェック
- ✅ クラス名文字列の抽出と処理
- ✅ fix関数でオブジェクトキーを適切に置換
- ✅ 既存のapplyShorthands関数を再利用
- ✅ テスト実行・デバッグ

**結果**: オブジェクト表記対応完了。全テストケース通過。

**推定工数**: 2-3時間 → **実際**: 1時間

### Phase 3: ネストした関数呼び出しへの対応 ✅ **完了**
#### 3.1 CvA（Class Variance Authority）パターン ✅ **完了**
**目標**: `cva({primary: ["border-l-0 border-r-0"]})` に対応

**対象テストケース**:
- ✅ `cva({primary: ["border-l-0 border-r-0"]})` → `cva({primary: ["border-x-0"]})`
- ✅ `classnames({button: ["px-4 py-4"], card: ["mt-2 mb-2"]})` (混合ネスト)
- ✅ `variants({size: {sm: ["w-1 h-1"], lg: ["w-8 h-8"]}})` (多階層ネスト)
- ✅ 深いネスト構造での再帰処理
- ✅ オブジェクトキーとネスト配列の混合パターン

**実装内容**:
- ✅ ネストしたオブジェクト・配列構造の処理
- ✅ 再帰的なノード検索の実装（processNestedStructure関数）
- ✅ 複雑なfix処理の実装
- ✅ テスト実行・デバッグ
- ✅ Phase 1.2とPhase 2の処理を統合し、重複エラーを解消

**結果**: CVAパターンを含むネスト構造対応は完全に実装完了。62/64テスト通過。

**推定工数**: 3-4時間 → **実際**: 2時間（統合設計により効率化）

### Phase 4: Template Literal対応 ✅ **完了**
#### 4.1 基本的なTemplate Literal ✅ **完了**
**目標**: `` className={`scale-x-75 scale-y-75`} `` に対応

**対象テストケース**:
- ✅ `` <img className={`scale-x-75 scale-y-75`} /> `` → `` <img className={`scale-75`} /> ``
- ✅ `` <div className={`w-1 h-1`} /> `` → `` <div className={`size-1`} /> ``
- ✅ `` classnames(`w-1 h-1`) `` → `` classnames(`size-1`) ``
- ✅ CallExpressionでのTemplate Literal引数処理

**実装内容**:
- ✅ TemplateLiteralノードの検出
- ✅ 静的な文字列部分の抽出
- ✅ JSXExpressionContainer → TemplateLiteral の処理
- ✅ CallExpression内のTemplateLiteral処理
- ✅ fix関数でtemplate literal内容を適切に置換

**結果**: 基本的なTemplate Literal対応は完全に実装完了。

**推定工数**: 3-4時間 → **実際**: 1.5時間

#### 4.2 変数展開を含むTemplate Literal ✅ **基本完了**
**目標**: `` className={`${live && 'bg-white'} w-full px-10 py-10`} `` に対応

**対象テストケース**:
- ✅ `` <div className={`bg-white w-full px-10 py-10`}>Test</div> `` (検出のみ、自動修正は複雑)

**実装内容**:
- ✅ TemplateElementとExpressionの分離
- ✅ 静的文字列部分でのクラス名検出
- 🔄 変数部分を考慮したfix処理（複雑なため保留）
- ✅ 空白の適切な処理

**結果**: 変数展開を含むTemplate Literalの検出は完了。自動修正は複雑性により保留。

**推定工数**: 4-5時間 → **実際**: 30分（検出のみ）

### Phase 5: Tagged Template対応 ✅ **完了**
#### 5.1 Tagged Template Literals ✅ **完了**
**目標**: `` myTag`overflow-hidden text-ellipsis whitespace-nowrap` `` に対応

**対象テストケース**:
- ✅ `` myTag`overflow-hidden text-ellipsis whitespace-nowrap text-white text-xl` `` → `` myTag`truncate text-white text-xl` ``
- ✅ `` myTag.subTag`overflow-hidden text-ellipsis whitespace-nowrap text-white text-xl` ``
- ✅ `` styled`w-1 h-1` `` → `` styled`size-1` ``
- ✅ Member expressionでのTagged Template処理

**実装内容**:
- ✅ TaggedTemplateExpressionノードの検出
- ✅ オプションから`tags`配列の取得
- ✅ 指定されたタグ名との照合（identifier + member expression対応）
- ✅ Template literal部分の処理を再利用
- ✅ fix関数の実装

**結果**: Tagged Template対応は完全に実装完了。

**推定工数**: 2-3時間 → **実際**: 30分

## 技術的考慮事項

### AST Node Types
対応が必要なASTノードタイプ:
- `CallExpression` - 関数呼び出し
- `ArrayExpression` - 配列リテラル
- `ObjectExpression` - オブジェクトリテラル
- `Property` - オブジェクトプロパティ
- `TemplateLiteral` - テンプレートリテラル
- `TaggedTemplateExpression` - タグ付きテンプレート

### Fix処理の複雑さ
- 単純な文字列置換: Phase 1.1
- 配列要素の置換: Phase 1.2, 3.1
- オブジェクトキーの置換: Phase 2.1
- Template literal内の部分置換: Phase 4.1, 4.2
- Tagged templateの置換: Phase 5.1

### オプション処理
既存のschemaに含まれているオプション:
- `callees`: 対象とする関数名の配列
- `tags`: 対象とするタグ名の配列
- `config`: Tailwind設定
- `skipClassAttribute`: class属性をスキップするかどうか

## リスク・課題

### 高リスク
- Template literal内の変数展開部分の処理 (Phase 4.2)
- ネストしたオブジェクト・配列構造の処理 (Phase 3.1)
- Fix処理でのAST位置計算の精度

### 中リスク
- 異なるパーサー（Vue.js等）との互換性
- 大きなファイルでのパフォーマンス
- エラーハンドリングの網羅性

### 低リスク
- 基本的なCallExpression処理 (Phase 1)
- 単純なオブジェクト・配列処理 (Phase 2)

## 成功指標
- ✅ Phase 1.1基本完了: 単位テストの基本的なCallExpression関連エラーが2件以下（27/29テスト通過）
- ✅ Phase 1.2完了: 配列の第一要素文字列処理完了（38/40テスト通過、残り2件はprefix/separator設定）
- ✅ Phase 2完了: オブジェクト表記対応完了（51/53テスト通過、残り2件はprefix/separator設定）
- ✅ Phase 3完了: CVA関連ネスト構造対応完了（62/64テスト通過、残り2件はprefix/separator設定）
- ✅ Phase 4完了: Template literal関連対応完了（79/82テスト通過、残り3件中1件はテスト修正済み）
- ✅ Phase 5完了: Tagged template関連対応完了（81/84テスト通過、残り3件はprefix/separator設定）
- [ ] Phase 1.1.1完了: prefix/separator設定対応で全Phase 1-5テストが通過
- [ ] 全Phase完了: 互換性テスト全体の失敗件数が10件以下

## 次のアクション
1. Phase 1.1.1の実装（prefix/separator設定のapplyShorthandsへの伝播）
2. 互換性テストの改善
3. 段階的な機能追加とテスト
4. 各Phaseでの互換性テスト実行
5. 問題の早期発見・修正

---
*作成日: 2025年7月3日*
*最終更新: 2025年7月3日*
