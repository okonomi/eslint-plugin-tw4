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
  // Check both the object name and property name
  if (
    node.tag.type === "MemberExpression" &&
    node.tag.property.type === "Identifier"
  ) {
    // First check if the property name matches
    if (tags.includes(node.tag.property.name)) {
      return true
    }
    // Then check if the object name matches (for cases like myTag.subTag where myTag is the target)
    if (
      node.tag.object.type === "Identifier" &&
      tags.includes(node.tag.object.name)
    ) {
      return true
    }
  }

  // Handle call expressions: tagName(args)`...`
  if (
    node.tag.type === "CallExpression" &&
    node.tag.callee.type === "Identifier"
  ) {
    return tags.includes(node.tag.callee.name)
  }

  return false
}
