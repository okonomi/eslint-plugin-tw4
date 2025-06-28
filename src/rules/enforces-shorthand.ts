import { ESLintUtils } from "@typescript-eslint/utils"
import { applyShorthands } from "../shorthand"

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)

export default createRule({
  name: "enforces-shorthand",
  meta: {
    type: "suggestion",
    docs: {
      description: "",
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
  defaultOptions: [],
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          (node.name.name !== "className" && node.name.name !== "class") ||
          !node.value
        ) {
          return
        }

        // string literal
        if (
          node.value.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          const result = applyShorthands(node.value.value)
          if (result.applied) {
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
          }
        }
      },
    }
  },
})
