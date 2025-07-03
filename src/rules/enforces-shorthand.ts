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
    const tags = (options as { tags?: string[] }).tags || []
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

    // Helper function to process template literals
    function processTemplateLiteral(
      templateLiteral: TSESTree.TemplateLiteral,
    ): void {
      // Check if template literal has only static content (no expressions)
      if (
        templateLiteral.expressions.length === 0 &&
        templateLiteral.quasis.length === 1
      ) {
        // Simple template literal with no variables: `class-names`
        const staticContent = templateLiteral.quasis[0].value.cooked
        if (staticContent) {
          processClassNames(
            staticContent,
            templateLiteral,
            `\`${staticContent}\``,
          )
        }
      } else if (templateLiteral.quasis.length > 0) {
        // Template literal with expressions: handle static parts only
        for (const quasi of templateLiteral.quasis) {
          const staticContent = quasi.value.cooked
          if (staticContent?.trim()) {
            // Process only if the static part contains classes
            const result = applyShorthands(staticContent)
            if (result.applied) {
              // For mixed template literals, we need to be careful with fix
              // For now, report but don't auto-fix complex template literals
              if (result.transformations.length > 0) {
                for (const transformation of result.transformations) {
                  context.report({
                    node: templateLiteral,
                    messageId: "useShorthand",
                    data: {
                      shorthand: transformation.shorthand,
                      classnames: transformation.classnames,
                    },
                    // TODO: Implement complex template literal fix
                    // fix(fixer) { ... }
                  })
                }
              }
            }
          }
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

    // Helper function to check if a tag matches tags option
    function isTargetTag(node: TSESTree.TaggedTemplateExpression): boolean {
      if (tags.length === 0) return false

      // Handle simple tags: tagName`...`
      if (node.tag.type === "Identifier") {
        return tags.includes(node.tag.name)
      }

      // Handle member expressions: obj.tagName`...`
      if (
        node.tag.type === "MemberExpression" &&
        node.tag.property.type === "Identifier"
      ) {
        return tags.includes(node.tag.property.name)
      }

      return false
    }

    // Helper function to recursively search for class names in nested structures
    function processNestedStructure(node: TSESTree.Node): void {
      if (node.type === "ArrayExpression") {
        // Process each element in the array
        for (const element of node.elements) {
          if (
            element &&
            element.type === "Literal" &&
            typeof element.value === "string"
          ) {
            const classValue = element.value
            processClassNames(classValue, element, `'${classValue}'`)
          } else if (element) {
            // Recursively process nested structures
            processNestedStructure(element)
          }
        }
      } else if (node.type === "ObjectExpression") {
        // Process each property in the object
        for (const property of node.properties) {
          if (property.type === "Property") {
            // Check if the key is a class name
            let classValue: string | null = null

            if (
              property.key.type === "Literal" &&
              typeof property.key.value === "string"
            ) {
              classValue = property.key.value
            } else if (
              property.key.type === "Identifier" &&
              !property.computed
            ) {
              classValue = property.key.name
            }

            if (classValue) {
              processClassNames(classValue, property.key, `'${classValue}'`)
            }

            // Recursively process the property value
            processNestedStructure(property.value)
          }
        }
      }
    }

    return {
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        // Check if this is a target tagged template
        if (!isTargetTag(node)) {
          return
        }

        // Process the template literal part
        processTemplateLiteral(node.quasi)
      },

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

        // Handle template literal as first argument: functionName(`class-names`)
        if (firstArg.type === "TemplateLiteral") {
          processTemplateLiteral(firstArg)
        }

        // Phase 1.2, 2 & 3: Process arrays, objects and nested structures
        // This unified approach handles:
        // - Simple arrays: ['class-names']
        // - Simple objects: {'class-names': true}
        // - Complex nested CVA patterns: {variants: {size: ['class-names']}}
        if (
          firstArg.type === "ArrayExpression" ||
          firstArg.type === "ObjectExpression"
        ) {
          processNestedStructure(firstArg)
        }
      },

      JSXAttribute(node) {
        if (
          (node.name.name !== "className" && node.name.name !== "class") ||
          !node.value
        ) {
          return
        }

        // Template literal: className={`class-names`}
        if (
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "TemplateLiteral"
        ) {
          const templateLiteral = node.value.expression
          processTemplateLiteral(templateLiteral)
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
