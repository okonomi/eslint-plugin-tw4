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
 * Extract quote style from original text
 */
export function detectQuoteStyle(originalText: string): QuoteStyle | null {
  // Check if the text contains quoted strings
  const doubleQuoteMatch = originalText.match(/"/g)
  const singleQuoteMatch = originalText.match(/'/g)
  
  if (doubleQuoteMatch && !singleQuoteMatch) {
    return "double"
  }
  if (singleQuoteMatch && !doubleQuoteMatch) {
    return "single"
  }
  if (doubleQuoteMatch && singleQuoteMatch) {
    // If both exist, prefer the first one found
    const firstDouble = originalText.indexOf('"')
    const firstSingle = originalText.indexOf("'")
    return firstDouble < firstSingle ? "double" : "single"
  }
  
  return null
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

/**
 * Preserve original quote style when replacing text
 */
export function preserveQuoteStyle(
  newText: string,
  originalText: string,
  fallbackContext?: RuleContext<string, readonly unknown[]>,
): string {
  const detectedStyle = detectQuoteStyle(originalText)
  
  if (detectedStyle) {
    // If newText already has quotes, replace them with the detected style
    if (detectedStyle === "double") {
      return newText.replace(/'/g, '"')
    } else {
      return newText.replace(/"/g, "'")
    }
  }
  
  // Fallback to context-based style
  if (fallbackContext) {
    const contextStyle = getQuoteStyle(fallbackContext)
    if (contextStyle === "double") {
      return newText.replace(/'/g, '"')
    } else {
      return newText.replace(/"/g, "'")
    }
  }
  
  return newText
}

/**
 * Replace text while preserving quote style
 */
export function replaceWithQuotePreservation(
  fullText: string,
  oldValue: string,
  newValue: string,
): string {
  const detectedStyle = detectQuoteStyle(fullText)
  
  if (detectedStyle) {
    // Wrap newValue with the same quote style as detected in fullText
    const wrappedNewValue = wrapWithQuotes(newValue, detectedStyle)
    
    // Find and replace the quoted old value
    const quotedOldValue = wrapWithQuotes(oldValue, detectedStyle)
    return fullText.replace(quotedOldValue, wrappedNewValue)
  }
  
  // Fallback: replace without quote consideration
  return fullText.replace(oldValue, newValue)
}
