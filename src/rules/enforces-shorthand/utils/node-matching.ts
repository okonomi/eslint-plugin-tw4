import type { CallExpressionNode, TaggedTemplateNode } from "../types"

/**
 * Check if a function name matches callees option
 * Handles both simple function calls and member expressions
 */
export function isTargetCallee(
  node: CallExpressionNode,
  callees: string[],
): boolean {
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

/**
 * Check if a tag matches tags option
 * Handles both simple tags and member expressions
 */
export function isTargetTag(node: TaggedTemplateNode, tags: string[]): boolean {
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
