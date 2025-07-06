// biome-ignore lint/suspicious/noExplicitAny: Vue AST nodes require any type
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TSESTree } from "@typescript-eslint/utils"
import { ESLintUtils } from "@typescript-eslint/utils"
import { CallExpressionHandler } from "./handlers/call-expression-handler"
import { JSXAttributeHandler } from "./handlers/jsx-attribute-handler"
import { TaggedTemplateHandler } from "./handlers/tagged-template-handler"
import { parseOptions } from "./options"
import { processClassNames } from "./processors/class-processor"

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)

/**
 * Main enforces-shorthand rule with refactored structure
 */
export default createRule({
  name: "enforces-shorthand",
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce Tailwind CSS shorthand class names",
    },
    fixable: "code",
    messages: {
      useShorthand:
        'Use shorthand "{{shorthand}}" instead of class names "{{classnames}}".',
    },
    schema: [
      {
        type: "object",
        properties: {
          callees: {
            type: "array",
            items: { type: "string", minLength: 0 },
            uniqueItems: true,
          },
          config: {
            type: ["object", "string"],
          },
          skipClassAttribute: {
            type: "boolean",
            default: false,
          },
          tags: {
            type: "array",
            items: { type: "string", minLength: 0 },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}] as const,
  create(context) {
    const options = parseOptions(context.options[0] || {})

    // Extract config and ensure it's a TailwindConfig object (not string)
    const config =
      typeof options.config === "object" ? options.config : undefined

    // Create handlers with configured options
    const jsxHandler = new JSXAttributeHandler(context, config)
    const callHandler = new CallExpressionHandler(
      context,
      options.callees,
      config,
    )
    const templateHandler = new TaggedTemplateHandler(
      context,
      options.tags,
      config,
    )

    const visitors: Record<string, (node: any) => void> = {
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        templateHandler.handle(node)
      },

      CallExpression(node: TSESTree.CallExpression) {
        callHandler.handle(node)
      },

      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (options.skipClassAttribute) {
          return
        }
        jsxHandler.handle(node)
      },
    }

    // Add Vue support by handling VAttribute nodes via Program:exit
    visitors["Program:exit"] = (node: any) => {
      // Walk the entire AST to find VAttribute nodes
      function walkForVueAttributes(n: any) {
        if (!n || typeof n !== "object") return

        if (n.type === "VAttribute") {
          if (options.skipClassAttribute) {
            return
          }

          // Check if this is a class attribute
          const attributeName = n.key?.name || n.key?.argument?.name
          if (attributeName === "class") {
            // For static class attributes, process directly
            if (!n.directive && n.value?.type === "VLiteral") {
              // Process class string directly using class processor
              const result = processClassNames(n.value.value, config)
              if (result.applied) {
                // Report transformations for Vue static classes
                for (const transformation of result.transformations) {
                  context.report({
                    node: n,
                    messageId: "useShorthand",
                    data: {
                      shorthand: transformation.shorthand,
                      classnames: transformation.classnames,
                    },
                  })
                }
              }
            }
            // For dynamic class attributes (:class), treat as expressions
            else if (n.directive && n.value?.expression) {
              // Handle dynamic expressions similar to call expressions
              const expression = n.value.expression
              if (expression.type === "ArrayExpression") {
                // Handle array syntax: :class="['class1', 'class2']"
                for (const element of expression.elements) {
                  if (
                    element?.type === "Literal" &&
                    typeof element.value === "string"
                  ) {
                    const mockCallNode = {
                      type: "CallExpression",
                      callee: { name: "class" },
                      arguments: [element],
                    }
                    callHandler.handle(mockCallNode as any)
                  }
                }
              } else if (expression.type === "ObjectExpression") {
                // Handle object syntax: :class="{'class1': true, 'class2': false}"
                for (const property of expression.properties) {
                  if (
                    property.type === "Property" &&
                    property.key?.type === "Literal" &&
                    typeof property.key.value === "string"
                  ) {
                    const mockCallNode = {
                      type: "CallExpression",
                      callee: { name: "class" },
                      arguments: [property.key],
                    }
                    callHandler.handle(mockCallNode as any)
                  }
                }
              } else if (expression.type === "CallExpression") {
                // Handle function call syntax: :class="ctl('class1 class2')"
                callHandler.handle(expression)
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

    return visitors
  },
})
