import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processTemplateLiteral } from "../processors/templates"
import type { TaggedTemplateNode, TailwindConfig } from "../types"
import { isTargetTag } from "../utils/node-matching"

/**
 * Handle tagged template expression nodes
 */
export function handleTaggedTemplate(
  node: TaggedTemplateNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  tags: string[],
  config?: TailwindConfig,
): void {
  // Check if this is a target tagged template
  if (!isTargetTag(node, tags)) {
    return
  }

  // Process the template literal part
  processTemplateLiteral(node.quasi, context, config)
}
