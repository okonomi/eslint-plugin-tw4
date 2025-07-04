import type { TSESTree } from "@typescript-eslint/utils"
import { ESLintUtils } from "@typescript-eslint/utils"
import { CallExpressionHandler } from "./handlers/call-expression-handler"
import { JSXAttributeHandler } from "./handlers/jsx-attribute-handler"
import { TaggedTemplateHandler } from "./handlers/tagged-template-handler"
import { parseOptions } from "./options"

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

    // Create handlers with configured options
    const jsxHandler = new JSXAttributeHandler(context)
    const callHandler = new CallExpressionHandler(context, options.callees)
    const templateHandler = new TaggedTemplateHandler(context, options.tags)

    return {
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
  },
})
