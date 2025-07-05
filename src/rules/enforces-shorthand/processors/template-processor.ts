import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import type { TemplateNode } from "../types"
import { reportErrors } from "../utils/error-reporter"
import { processClassNames } from "./class-processor"

/**
 * Process template literals for shorthand transformations
 * Handles both simple and complex template literals
 */
export function processTemplateLiteral(
  templateLiteral: TemplateNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
): void {
  // Check if template literal has only static content (no expressions)
  if (
    templateLiteral.expressions.length === 0 &&
    templateLiteral.quasis.length === 1
  ) {
    // Simple template literal with no variables: `class-names`
    const staticContent = templateLiteral.quasis[0].value.cooked
    if (staticContent) {
      const result = processClassNames(staticContent)
      reportErrors(context, {
        targetNode: templateLiteral,
        fixText: `\`${staticContent}\``,
        originalValue: staticContent,
        result,
      })
    }
  } else if (templateLiteral.quasis.length > 0) {
    // Template literal with expressions: handle static parts only
    for (const quasi of templateLiteral.quasis) {
      const staticContent = quasi.value.cooked
      if (staticContent?.trim()) {
        // Process only if the static part contains classes
        const result = processClassNames(staticContent)
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
