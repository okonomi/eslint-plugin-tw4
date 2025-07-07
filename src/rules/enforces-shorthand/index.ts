/** biome-ignore-all lint/suspicious/noExplicitAny: node type is complex */

import type { TSESTree } from "@typescript-eslint/utils"
import { ESLintUtils } from "@typescript-eslint/utils"
import { handleCallExpression } from "./handlers/call-expressions"
import { handleJSXAttribute } from "./handlers/jsx-attributes"
import { handleTaggedTemplate } from "./handlers/tagged-templates"
import { handleVueAttributes } from "./handlers/vue-attributes"
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

    // Extract config and ensure it's a TailwindConfig object (not string)
    const config =
      typeof options.config === "object" ? options.config : undefined

    // Define handler functions with configured options

    const visitors: Record<string, (node: any) => void> = {
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        handleTaggedTemplate(node, context, options.tags, config)
      },

      CallExpression(node: TSESTree.CallExpression) {
        handleCallExpression(node, context, options.callees, config)
      },

      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (options.skipClassAttribute) {
          return
        }
        handleJSXAttribute(node, context, config)
      },
    }

    // Add Vue support by handling VAttribute nodes via Program:exit
    visitors["Program:exit"] = (node: any) => {
      handleVueAttributes(
        node,
        context,
        options.skipClassAttribute,
        options.callees,
        config,
      )
    }

    return visitors
  },
})
