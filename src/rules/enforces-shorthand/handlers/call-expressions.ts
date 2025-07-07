import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processClassNames } from "../processors/classes"
import { processNestedStructure } from "../processors/nested"
import { processTemplateLiteral } from "../processors/templates"
import type { CallExpressionNode, TailwindConfig } from "../types"
import { reportErrors } from "../utils/error-reporter"
import { isTargetCallee } from "../utils/node-matching"
import { wrapWithQuotesFromContext } from "../utils/quote-utils"

/**
 * Handle call expression nodes
 */
export function handleCallExpression(
  node: CallExpressionNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  callees: string[],
  config?: TailwindConfig,
): void {
  // Check if this is a target function call
  if (!isTargetCallee(node, callees)) {
    return
  }

  // Check if there are arguments
  if (node.arguments.length === 0) {
    return
  }

  const firstArg = node.arguments[0]

  // Handle string literal as first argument: functionName('class-names')
  if (firstArg.type === "Literal" && typeof firstArg.value === "string") {
    const classValue = firstArg.value
    const result = processClassNames(classValue, config)
    reportErrors(context, {
      targetNode: firstArg,
      fixText: wrapWithQuotesFromContext(classValue, context),
      originalValue: classValue,
      result,
    })
  }

  // Handle template literal as first argument: functionName(`class-names`)
  if (firstArg.type === "TemplateLiteral") {
    processTemplateLiteral(firstArg, context, config)
  }

  // Process arrays, objects and nested structures
  // This unified approach handles:
  // - Simple arrays: ['class-names']
  // - Simple objects: {'class-names': true}
  // - Complex nested CVA patterns: {variants: {size: ['class-names']}}
  if (
    firstArg.type === "ArrayExpression" ||
    firstArg.type === "ObjectExpression"
  ) {
    processNestedStructure(firstArg, context, config)
  }
}
