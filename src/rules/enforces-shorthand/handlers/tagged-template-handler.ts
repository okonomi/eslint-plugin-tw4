import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processTemplateLiteral } from "../processors/template-processor"
import type { TaggedTemplateNode, TailwindConfig } from "../types"
import { isTargetTag } from "../utils/node-matching"

/**
 * Handler for tagged template expression processing
 */
export class TaggedTemplateHandler {
  constructor(
    private context: RuleContext<"useShorthand", readonly unknown[]>,
    private tags: string[],
    private config?: TailwindConfig,
  ) {}

  /**
   * Handle tagged template expression nodes
   */
  handle(node: TaggedTemplateNode): void {
    // Check if this is a target tagged template
    if (!isTargetTag(node, this.tags)) {
      return
    }

    // Process the template literal part
    processTemplateLiteral(node.quasi, this.context, this.config)
  }
}
