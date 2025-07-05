import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import type { TailwindConfig, TargetNode } from "../types"
import { reportErrors } from "../utils/error-reporter"
import { processClassNames } from "./class-processor"

/**
 * Recursively search for class names in nested structures
 * Handles arrays and objects with complex nesting patterns
 */
export function processNestedStructure(
  node: TargetNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  config?: TailwindConfig,
): void {
  if (node.type === "ArrayExpression") {
    // Process each element in the array
    for (const element of node.elements) {
      if (
        element &&
        element.type === "Literal" &&
        typeof element.value === "string"
      ) {
        const classValue = element.value
        const result = processClassNames(classValue, config)

        // Get the source code to preserve original formatting
        const sourceCode = context.sourceCode || context.getSourceCode()
        const originalText = sourceCode.getText(element)

        reportErrors(context, {
          targetNode: element,
          fixText: originalText,
          originalValue: classValue,
          result,
        })
      } else if (element) {
        // Recursively process nested structures
        processNestedStructure(element, context, config)
      }
    }
  } else if (node.type === "ObjectExpression") {
    // Process each property in the object
    for (const property of node.properties) {
      if (property.type === "Property") {
        // Check if the key is a class name
        let classValue: string | null = null

        if (
          property.key.type === "Literal" &&
          typeof property.key.value === "string"
        ) {
          classValue = property.key.value
        } else if (property.key.type === "Identifier" && !property.computed) {
          classValue = property.key.name
        }

        if (classValue) {
          const result = processClassNames(classValue, config)

          // Get the source code to preserve original formatting
          const sourceCode = context.sourceCode || context.getSourceCode()
          const originalText = sourceCode.getText(property.key)

          reportErrors(context, {
            targetNode: property.key,
            fixText: originalText,
            originalValue: classValue,
            result,
          })
        }

        // Recursively process the property value
        processNestedStructure(property.value, context, config)
      }
    }
  }
}
