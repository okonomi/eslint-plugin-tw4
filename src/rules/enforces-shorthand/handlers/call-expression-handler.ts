import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processClassNames } from "../processors/classes"
import { processNestedStructure } from "../processors/nested"
import { processTemplateLiteral } from "../processors/templates"
import type { CallExpressionNode, TailwindConfig } from "../types"
import { reportErrors } from "../utils/error-reporter"
import { isTargetCallee } from "../utils/node-matching"
import { wrapWithQuotesFromContext } from "../utils/quote-utils"

/**
 * Handler for call expression processing
 */
export class CallExpressionHandler {
  constructor(
    private context: RuleContext<"useShorthand", readonly unknown[]>,
    private callees: string[],
    private config?: TailwindConfig,
  ) {}

  /**
   * Handle call expression nodes
   */
  handle(node: CallExpressionNode): void {
    // Check if this is a target function call
    if (!isTargetCallee(node, this.callees)) {
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
      const result = processClassNames(classValue, this.config)
      reportErrors(this.context, {
        targetNode: firstArg,
        fixText: wrapWithQuotesFromContext(classValue, this.context),
        originalValue: classValue,
        result,
      })
    }

    // Handle template literal as first argument: functionName(`class-names`)
    if (firstArg.type === "TemplateLiteral") {
      processTemplateLiteral(firstArg, this.context, this.config)
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
      processNestedStructure(firstArg, this.context, this.config)
    }
  }
}
