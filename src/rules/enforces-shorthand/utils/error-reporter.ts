import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import type { ErrorReportData } from "../types"
import { replaceWithQuotePreservation } from "./quote-utils"

/**
 * Centralized error reporting logic
 * Handles different types of transformations uniformly
 */
export function reportErrors(
  context: RuleContext<"useShorthand", readonly unknown[]>,
  data: ErrorReportData,
): void {
  const { targetNode, fixText, originalValue, result } = data

  if (!result.applied) {
    return
  }

  if (result.transformations.length > 0) {
    // Report each transformation as a separate error
    for (const transformation of result.transformations) {
      context.report({
        node: targetNode,
        messageId: "useShorthand",
        data: {
          shorthand: transformation.shorthand,
          classnames: transformation.classnames,
        },
        fix(fixer) {
          const fixedText = replaceWithQuotePreservation(
            fixText,
            originalValue,
            result.value,
          )
          return fixer.replaceText(targetNode, fixedText)
        },
      })
    }
  } else if (result.value !== originalValue) {
    // Handle cases where transformation occurred but no explicit transformations recorded
    const originalClasses = originalValue.split(/\s+/).filter(Boolean)

    // For redundancy removal cases, report all original classes as being consolidated
    context.report({
      node: targetNode,
      messageId: "useShorthand",
      data: {
        shorthand: result.value,
        classnames: originalClasses.join(", "),
      },
      fix(fixer) {
        const fixedText = replaceWithQuotePreservation(
          fixText,
          originalValue,
          result.value,
        )
        return fixer.replaceText(targetNode, fixedText)
      },
    })
  }
}
