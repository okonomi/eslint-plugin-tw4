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
    return {}
  },
})
