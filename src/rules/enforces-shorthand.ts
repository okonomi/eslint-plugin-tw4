import { ESLintUtils, type TSESTree } from "@typescript-eslint/utils"
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
  defaultOptions: [{}] as const,
  create(context) {
    const options = context.options[0] || {}
    const callees = (options as { callees?: string[] }).callees || []
    // const config = (options as { config?: object }).config

    // Helper function to process class names and report errors
    function processClassNames(
      classValue: string,
      targetNode: TSESTree.Node,
      fixText: string,
    ) {
      const result = applyShorthands(classValue)
      if (result.applied) {
        if (result.transformations.length > 0) {
          // Report each transformation as a separate error
          for (const transformation of result.transformations) {
            context.report({
              node: targetNode,
              messageId: "useShorthand",
              data: {
                shorthand: transformation.shorthand,
                classnames: transformation.classnames,
              },
              fix(fixer) {
                return fixer.replaceText(
                  targetNode,
                  fixText.replace(classValue, result.value),
                )
              },
            })
          }
        } else if (result.value !== classValue) {
          // Handle cases where transformation occurred but no explicit transformations recorded
          const originalClasses = classValue.split(/\s+/).filter(Boolean)

          // For redundancy removal cases, report all original classes as being consolidated
          context.report({
            node: targetNode,
            messageId: "useShorthand",
            data: {
              shorthand: result.value,
              classnames: originalClasses.join(", "),
            },
            fix(fixer) {
              return fixer.replaceText(
                targetNode,
                fixText.replace(classValue, result.value),
              )
            },
          })
        }
      }
    }

    // Helper function to check if a function name matches callees option
    function isTargetCallee(node: TSESTree.CallExpression): boolean {
      if (callees.length === 0) return false

      // Handle simple function calls: functionName()
      if (node.callee.type === "Identifier") {
        return callees.includes(node.callee.name)
      }

      // Handle member expressions: obj.functionName()
      if (
        node.callee.type === "MemberExpression" &&
        node.callee.property.type === "Identifier"
      ) {
        return callees.includes(node.callee.property.name)
      }

      return false
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Check if this is a target function call
        if (!isTargetCallee(node)) {
          return
        }

        // Check if there are arguments
        if (node.arguments.length === 0) {
          return
        }

        const firstArg = node.arguments[0]

        // Handle string literal as first argument: functionName('class-names')
        if (firstArg.type === "Literal" && typeof firstArg.value === "string") {
          const classValue = firstArg.value

          processClassNames(classValue, firstArg, `'${classValue}'`)
        }
      },

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
            if (result.transformations.length > 0) {
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
            } else if (result.value !== node.value.value) {
              // Handle cases where transformation occurred but no explicit transformations recorded
              const originalClasses = node.value.value
                .split(/\s+/)
                .filter(Boolean)

              // For redundancy removal cases, report all original classes as being consolidated
              context.report({
                node: node.value,
                messageId: "useShorthand",
                data: {
                  shorthand: result.value,
                  classnames: originalClasses.join(", "),
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
