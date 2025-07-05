import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import type { ProcessingResult, TailwindConfig, TemplateNode } from "../types"
import { reportErrors } from "../utils/error-reporter"
import { processClassNames } from "./class-processor"

/**
 * Process template literals for shorthand transformations
 * Handles both simple and complex template literals
 */
export function processTemplateLiteral(
  templateLiteral: TemplateNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  config?: TailwindConfig,
): void {
  // Check if template literal has only static content (no expressions)
  if (
    templateLiteral.expressions.length === 0 &&
    templateLiteral.quasis.length === 1
  ) {
    // Simple template literal with no variables: `class-names`
    const staticContent = templateLiteral.quasis[0].value.cooked
    if (staticContent) {
      const result = processClassNames(staticContent, config)
      reportErrors(context, {
        targetNode: templateLiteral,
        fixText: `\`${staticContent}\``,
        originalValue: staticContent,
        result,
      })
    }
  } else if (templateLiteral.quasis.length > 0) {
    // Template literal with expressions: handle static parts with fix
    const processedParts: {
      staticContent: string
      result: ProcessingResult
      quasiIndex: number
    }[] = []
    let hasTransformations = false

    // Process each static part (quasi)
    for (let i = 0; i < templateLiteral.quasis.length; i++) {
      const quasi = templateLiteral.quasis[i]
      const staticContent = quasi.value.cooked || ""
      const result = processClassNames(staticContent, config)

      processedParts.push({ staticContent, result, quasiIndex: i })

      if (result.applied) {
        hasTransformations = true
      }
    }

    if (hasTransformations) {
      // Collect all transformations for reporting
      const allTransformations: Array<{
        shorthand: string
        classnames: string
      }> = []

      for (const part of processedParts) {
        if (part.result.applied && part.result.transformations.length > 0) {
          allTransformations.push(...part.result.transformations)
        }
      }

      // Report each transformation with fix
      for (const transformation of allTransformations) {
        context.report({
          node: templateLiteral,
          messageId: "useShorthand",
          data: {
            shorthand: transformation.shorthand,
            classnames: transformation.classnames,
          },
          fix(fixer) {
            // Reconstruct the entire template literal with fixes
            let fixedTemplate = "`"

            for (let i = 0; i < templateLiteral.quasis.length; i++) {
              const part = processedParts[i]

              // Use transformed content if available, otherwise original
              let contentToUse = part.result.applied
                ? part.result.value
                : part.staticContent

              // Preserve leading/trailing spaces if they exist in original content
              if (part.result.applied && part.staticContent !== contentToUse) {
                const originalTrimmed = part.staticContent.trim()
                const transformedTrimmed = contentToUse.trim()

                // If the transformation changed the trimmed content, preserve spaces
                if (originalTrimmed !== transformedTrimmed) {
                  const leadingSpaces =
                    part.staticContent.match(/^\s*/)?.[0] || ""
                  const trailingSpaces =
                    part.staticContent.match(/\s*$/)?.[0] || ""
                  contentToUse =
                    leadingSpaces + transformedTrimmed + trailingSpaces
                }
              }

              fixedTemplate += contentToUse

              // Add expression back if this is not the last quasi
              if (i < templateLiteral.expressions.length) {
                const sourceCode = context.sourceCode || context.getSourceCode()
                const expressionText = sourceCode.getText(
                  templateLiteral.expressions[i],
                )
                fixedTemplate += `\${${expressionText}}`
              }
            }

            fixedTemplate += "`"
            return fixer.replaceText(templateLiteral, fixedTemplate)
          },
        })
      }
    }
  }
}
