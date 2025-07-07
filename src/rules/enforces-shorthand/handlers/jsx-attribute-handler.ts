import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processJSXAttribute } from "../processors/jsx"
import type { JSXAttributeNode, TailwindConfig } from "../types"

/**
 * Handler for JSX attribute processing
 */
export class JSXAttributeHandler {
  constructor(
    private context: RuleContext<"useShorthand", readonly unknown[]>,
    private config?: TailwindConfig,
  ) {}

  /**
   * Handle JSX attribute nodes
   */
  handle(node: JSXAttributeNode): void {
    processJSXAttribute(node, this.context, this.config)
  }
}
