import type { TSESTree } from "@typescript-eslint/utils"

/**
 * Rule options interface for enforces-shorthand rule
 */
export interface RuleOptions {
  /** Array of function names to target for processing */
  callees?: string[]
  /** Configuration object or string for tailwind processing */
  config?: object | string
  /** Whether to skip processing className/class attributes */
  skipClassAttribute?: boolean
  /** Array of tagged template literals to target */
  tags?: string[]
}

/**
 * Quote style preferences
 */
export type QuoteStyle = "single" | "double"

/**
 * Processing result from shorthand application
 */
export interface ProcessingResult {
  /** Whether any transformations were applied */
  applied: boolean
  /** The transformed value */
  value: string
  /** Array of specific transformations that occurred */
  transformations: Array<{
    /** The shorthand form */
    shorthand: string
    /** The original class names */
    classnames: string
  }>
}

/**
 * Node type aliases for better readability
 */
export type TargetNode = TSESTree.Node
export type LiteralNode = TSESTree.Literal
export type TemplateNode = TSESTree.TemplateLiteral
export type CallExpressionNode = TSESTree.CallExpression
export type TaggedTemplateNode = TSESTree.TaggedTemplateExpression
export type JSXAttributeNode = TSESTree.JSXAttribute
export type ArrayExpressionNode = TSESTree.ArrayExpression
export type ObjectExpressionNode = TSESTree.ObjectExpression

/**
 * Error reporting data structure
 */
export interface ErrorReportData {
  /** Target node to report error on */
  targetNode: TargetNode
  /** Fix text for the entire node */
  fixText: string
  /** Original class value being processed */
  originalValue: string
  /** Processing result from shorthand application */
  result: ProcessingResult
}
