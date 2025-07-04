import { ESLintUtils } from "@typescript-eslint/utils"

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)

/**
 * ESLint rule metadata and schema for enforces-shorthand
 */
export const ruleMetadata = {
  name: "enforces-shorthand",
  meta: {
    type: "suggestion" as const,
    docs: {
      description: "Enforce Tailwind CSS shorthand class names",
    },
    fixable: "code" as const,
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
}

export { createRule }
