/** biome-ignore-all lint/suspicious/noExplicitAny: Vue AST node types are complex */

import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processClassNames } from "../processors/classes"
import type { TailwindConfig } from "../types"
import { handleCallExpression } from "./call-expressions"

/**
 * Handle Vue VAttribute nodes for shorthand transformations
 */
export function handleVueAttributes(
  node: any,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  skipClassAttribute: boolean,
  callees: string[],
  config?: TailwindConfig,
): void {
  // Walk the entire AST to find VAttribute nodes
  function walkForVueAttributes(n: any) {
    if (!n || typeof n !== "object") return

    if (n.type === "VAttribute") {
      if (skipClassAttribute) {
        return
      }

      // Check if this is a class attribute (static or dynamic)
      const attributeName =
        n.key?.argument?.name || n.key?.name?.name || n.key?.name

      if (attributeName === "class") {
        // For static class attributes, process directly
        if (!n.directive && n.value?.type === "VLiteral") {
          // Process class string directly using class processor
          const result = processClassNames(n.value.value, config)
          if (result.applied) {
            // Report transformations for Vue static classes with autofix
            for (const transformation of result.transformations) {
              context.report({
                node: n,
                messageId: "useShorthand",
                data: {
                  shorthand: transformation.shorthand,
                  classnames: transformation.classnames,
                },
                fix(fixer) {
                  // Preserve original quote style
                  const originalText = context.getSourceCode().getText(n.value)
                  const quoteChar = originalText.startsWith("'") ? "'" : '"'
                  return fixer.replaceText(
                    n.value,
                    `${quoteChar}${result.value}${quoteChar}`,
                  )
                },
              })
            }
          }
        }
        // For dynamic class attributes (:class), treat as expressions
        else if (n.directive && n.value) {
          // Handle Vue dynamic expressions - check VExpressionContainer
          const expression =
            n.value.type === "VExpressionContainer"
              ? n.value.expression
              : n.value.expression

          if (expression && expression.type === "ArrayExpression") {
            // Handle array syntax: :class="['class1', 'class2']"
            for (const element of expression.elements) {
              if (
                element?.type === "Literal" &&
                typeof element.value === "string"
              ) {
                // Process each string element directly
                const result = processClassNames(element.value, config)
                if (result.applied) {
                  // Report transformations for Vue array elements with autofix
                  for (const transformation of result.transformations) {
                    context.report({
                      node: element,
                      messageId: "useShorthand",
                      data: {
                        shorthand: transformation.shorthand,
                        classnames: transformation.classnames,
                      },
                      fix(fixer) {
                        // Preserve original quote style
                        const originalText = context
                          .getSourceCode()
                          .getText(element)
                        const quoteChar = originalText.startsWith("'")
                          ? "'"
                          : '"'
                        return fixer.replaceText(
                          element,
                          `${quoteChar}${result.value}${quoteChar}`,
                        )
                      },
                    })
                  }
                }
              }
            }
          } else if (expression && expression.type === "ObjectExpression") {
            // Handle object syntax: :class="{'class1': true, 'class2': false}"
            try {
              for (const property of expression.properties || []) {
                if (
                  property.type === "Property" &&
                  property.key?.type === "Literal" &&
                  typeof property.key.value === "string"
                ) {
                  // Process each object key directly
                  const result = processClassNames(property.key.value, config)
                  if (result.applied) {
                    // Report transformations for Vue object keys with autofix
                    for (const transformation of result.transformations) {
                      context.report({
                        node: property.key,
                        messageId: "useShorthand",
                        data: {
                          shorthand: transformation.shorthand,
                          classnames: transformation.classnames,
                        },
                        fix(fixer) {
                          // Preserve original quote style
                          const originalText = context
                            .getSourceCode()
                            .getText(property.key)
                          const quoteChar = originalText.startsWith("'")
                            ? "'"
                            : '"'
                          return fixer.replaceText(
                            property.key,
                            `${quoteChar}${result.value}${quoteChar}`,
                          )
                        },
                      })
                    }
                  }
                }
              }
            } catch (error) {
              console.log("Error in Vue object processing:", error)
            }
          } else if (expression && expression.type === "CallExpression") {
            // Handle function call syntax: :class="ctl('class1 class2')"
            handleCallExpression(expression, context, callees, config)
          }
        }
      }
    }

    // Recursively walk child nodes
    for (const key in n) {
      if (key === "parent") continue // Avoid circular references
      const child = n[key]
      if (Array.isArray(child)) {
        child.forEach((item) => walkForVueAttributes(item))
      } else {
        walkForVueAttributes(child)
      }
    }
  }

  walkForVueAttributes(node)
}
