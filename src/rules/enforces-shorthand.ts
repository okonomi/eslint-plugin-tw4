import { ESLintUtils } from "@typescript-eslint/utils"
import { applyShorthand } from "../shorthand"

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
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className" || !node.value) {
          return
        }

        // string literal
        if (
          node.value.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          const result = applyShorthand(node.value.value)
          if (result.applied) {
            context.report({
              node: node.value,
              messageId: "useShorthand",
              data: {
                shorthand: result.shorthand,
                classnames: result.classnames,
              },
              fix(fixer) {
                return fixer.replaceText(node, `className="${result.value}"`)
              },
            })
          }
        }
      },
    }
  },
})
