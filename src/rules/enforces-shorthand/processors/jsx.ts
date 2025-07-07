import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import type { JSXAttributeNode, TailwindConfig } from "../types"
import { processClassNames } from "./classes"
import { processTemplateLiteral } from "./templates"

/**
 * Process JSX attributes for shorthand transformations
 * Handles different JSX value types (string literals, template literals)
 */
export function processJSXAttribute(
  node: JSXAttributeNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  config?: TailwindConfig,
): void {
  if (
    (node.name.name !== "className" && node.name.name !== "class") ||
    !node.value
  ) {
    return
  }

  // Template literal: className={`class-names`}
  if (
    node.value.type === "JSXExpressionContainer" &&
    node.value.expression.type === "TemplateLiteral"
  ) {
    const templateLiteral = node.value.expression
    processTemplateLiteral(templateLiteral, context, config)
  }

  // String literal: className="class-names"
  if (node.value.type === "Literal" && typeof node.value.value === "string") {
    const result = processClassNames(node.value.value, config)
    if (result.applied) {
      if (result.transformations.length > 0) {
        // Report each transformation as a separate error
        for (const transformation of result.transformations) {
          context.report({
            node: node.value,
            messageId: "useShorthand",
            data: {
              shorthand: transformation.shorthand,
              classnames: transformation.classnames,
            },
            fix(fixer) {
              const attributeName = node.name.name
              return fixer.replaceText(
                node,
                `${attributeName}="${result.value}"`,
              )
            },
          })
        }
      } else if (result.value !== node.value.value) {
        // Handle cases where transformation occurred but no explicit transformations recorded
        const originalClasses = node.value.value.split(/\s+/).filter(Boolean)

        // For redundancy removal cases, report all original classes as being consolidated
        context.report({
          node: node.value,
          messageId: "useShorthand",
          data: {
            shorthand: result.value,
            classnames: originalClasses.join(", "),
          },
          fix(fixer) {
            const attributeName = node.name.name
            return fixer.replaceText(node, `${attributeName}="${result.value}"`)
          },
        })
      }
    }
  }
}
