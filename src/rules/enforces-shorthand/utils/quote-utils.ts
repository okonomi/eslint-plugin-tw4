import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import type { QuoteStyle } from "../types"

/**
 * Get quote style preference from ESLint configuration
 * Defaults to single quotes if no preference is found
 */
export function getQuoteStyle(
  context: RuleContext<string, readonly unknown[]>,
): QuoteStyle {
  // Try to get from ESLint quotes rule configuration
  const sourceCode = context.sourceCode || context.getSourceCode()
  if (sourceCode?.parserServices?.program) {
    // Check for quotes rule in the current ESLint config
    const rules = context.settings?.quotes || []
    if (Array.isArray(rules) && rules.length > 0) {
      return rules[0] === "single" ? "single" : "double"
    }
  }
  // Default to single quotes to match most common style
  return "single"
}

/**
 * Wrap text with appropriate quotes based on style preference
 */
export function wrapWithQuotes(text: string, quoteStyle: QuoteStyle): string {
  return quoteStyle === "single" ? `'${text}'` : `"${text}"`
}

/**
 * Wrap text with appropriate quotes using context to determine style
 */
export function wrapWithQuotesFromContext(
  text: string,
  context: RuleContext<string, readonly unknown[]>,
): string {
  const style = getQuoteStyle(context)
  return wrapWithQuotes(text, style)
}
