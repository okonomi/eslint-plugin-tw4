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

#### 1.2 配列の第一要素が文字列の場合
**目標**: `classnames(['py-8 px-8 w-48 h-48 text-white'])` に対応

**対象テストケース**:
- `classnames(['py-8 px-8 w-48 h-48 text-white'])`

**実装内容**:
- [ ] ArrayExpression内の最初の要素をチェック
- [ ] 文字列リテラルの場合のみ処理
- [ ] fix関数で配列内の文字列を適切に置換
- [ ] テスト実行・デバッグ

**推定工数**: 1-2時間

### Phase 2: オブジェクト表記への対応
#### 2.1 オブジェクトのキーとしてのクラス名
**目標**: `classnames({'py-8 px-8 text-white': true})` に対応

**対象テストケース**:
- `classnames({'py-8 px-8 text-white': true})`
- `classnames({'!py-8 !px-8 text-white': true})`
- `classnames({'!pt-8 !pb-8 pr-8 !pl-8': true})`
- `classnames({'!pt-8 !pb-8 !pr-8 !pl-8': true})`
- `classnames({'!pt-8 pb-8 pr-8 pl-8': true})`
- `classnames({'md:!rounded-tr block md:rounded-tl md:rounded-br md:rounded-bl': true})`

**実装内容**:
- [ ] ObjectExpressionの検出
- [ ] プロパティのキーが文字列リテラル/Identifierの場合をチェック
- [ ] クラス名文字列の抽出と処理
- [ ] fix関数でオブジェクトキーを適切に置換
- [ ] テスト実行・デバッグ

**推定工数**: 2-3時間

### Phase 3: ネストした関数呼び出しへの対応
#### 3.1 CvA（Class Variance Authority）パターン
**目標**: `cva({primary: ["border-l-0 border-r-0"]})` に対応

**対象テストケース**:
- `cva({primary: ["border-l-0 border-r-0"]})`

**実装内容**:
- [ ] ネストしたオブジェクト・配列構造の処理
- [ ] 再帰的なノード検索の実装
- [ ] 複雑なfix処理の実装
- [ ] テスト実行・デバッグ

**推定工数**: 3-4時間

### Phase 4: Template Literal対応 (別途対応)
#### 4.1 基本的なTemplate Literal
**目標**: `` className={`scale-x-75 scale-y-75`} `` に対応

**対象テストケース**:
- `` <img className={`scale-x-75 scale-y-75`} /> ``
- Template literal内の複数行クラス名

**実装内容**:
- [ ] TemplateLiteralノードの検出
- [ ] 静的な文字列部分の抽出
- [ ] 動的部分がある場合の処理方針決定
- [ ] fix関数でtemplate literal内容を適切に置換

**推定工数**: 3-4時間

#### 4.2 変数展開を含むTemplate Literal
**目標**: `` className={`${live && 'bg-white'} w-full px-10 py-10`} `` に対応

**対象テストケース**:
- `` <div className={ctl(`${live && 'bg-white'} w-full px-10 py-10`)}>Leading space trim issue with fix</div> ``
- `` <div className={ctl(`${live && 'bg-white'} w-full px-10 py-10 `)}>Leading space trim issue with fix (2)</div> ``
- `` <div className={ctl(`w-full px-10 py-10 ${live && 'bg-white'}`)}>Trailing space trim issue with fix</div> ``
- `` <div className={ctl(` w-full px-10 py-10 ${live && 'bg-white'}`)}>Trailing space trim issue with fix (2)</div> ``

**実装内容**:
- [ ] TemplateElementとExpressionの分離
- [ ] 静的文字列部分でのクラス名検出
- [ ] 変数部分を考慮したfix処理
- [ ] 空白の適切な処理

**推定工数**: 4-5時間

### Phase 5: Tagged Template対応
#### 5.1 Tagged Template Literals
**目標**: `` myTag`overflow-hidden text-ellipsis whitespace-nowrap` `` に対応

**対象テストケース**:
- `` myTag`overflow-hidden text-ellipsis whitespace-nowrap text-white text-xl` ``
- `` myTag.subTag`overflow-hidden text-ellipsis whitespace-nowrap text-white text-xl` ``
- `` myTag(SomeComponent)`overflow-hidden text-ellipsis whitespace-nowrap text-white text-xl` ``

**実装内容**:
- [ ] TaggedTemplateExpressionノードの検出
- [ ] オプションから`tags`配列の取得
- [ ] 指定されたタグ名との照合
- [ ] Template literal部分の処理を再利用
- [ ] fix関数の実装

**推定工数**: 2-3時間

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
- ✅ Phase 1基本完了: 単位テストの基本的なCallExpression関連エラーが2件以下（27/29テスト通過）
- [ ] Phase 1完了: 互換性テストの基本的なCallExpression関連エラーが5件以下
- [ ] Phase 2完了: オブジェクト表記関連エラーが0件
- [ ] Phase 3完了: CVA関連エラーが0件
- [ ] Phase 4完了: Template literal関連エラーが3件以下
- [ ] Phase 5完了: Tagged template関連エラーが0件
- [ ] 全Phase完了: 互換性テスト全体の失敗件数が10件以下

## 次のアクション
1. Phase 1.1の実装開始
2. 小さなテストケースでの動作確認
3. 段階的な機能追加とテスト
4. 各Phaseでの互換性テスト実行
5. 問題の早期発見・修正

---
*作成日: 2025年7月3日*
*最終更新: 2025年7月3日*
