import { ESLintUtils } from "@typescript-eslint/utils"

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
          const value = node.value.value
          // ペアごとにチェック
          const pairs = [
            { w: /w-([^ ]+)/, h: /h-([^ ]+)/, shorthand: "size-" },
            { w: /min-w-([^ ]+)/, h: /min-h-([^ ]+)/, shorthand: "min-size-" },
            { w: /max-w-([^ ]+)/, h: /max-h-([^ ]+)/, shorthand: "max-size-" },
          ]
          for (const { w, h } of pairs) {
            const wMatch = value.match(w)
            const hMatch = value.match(h)
            if (wMatch && hMatch && wMatch[1] === hMatch[1]) {
              context.report({
                node: node.value,
                messageId: "useShorthand",
              })
              break
            }
          }
        }
      },
    }
  },
})
