import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { processJSXAttribute } from "../processors/jsx"
import type { JSXAttributeNode, TailwindConfig } from "../types"

/**
 * Handle JSX attribute nodes
 */
export function handleJSXAttribute(
  node: JSXAttributeNode,
  context: RuleContext<"useShorthand", readonly unknown[]>,
  config?: TailwindConfig,
): void {
  processJSXAttribute(node, context, config)
}
