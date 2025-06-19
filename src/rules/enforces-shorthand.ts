import { ESLintUtils } from "@typescript-eslint/utils"
import { shorthand } from "../shorthand"

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
      useShorthand: "Use shorthand",
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
          const classString = shorthand(node.value.value)
          if (classString !== node.value.value) {
            context.report({
              node: node.value,
              messageId: "useShorthand",
              fix(fixer) {
                return fixer.replaceText(node, `className="${classString}"`)
              },
            })
          }
        }
      },
    }
  },
})
