import { describe, expect, it } from "vitest"
import type { CallExpressionNode, TaggedTemplateNode } from "../types"
import { isTargetCallee, isTargetTag } from "./node-matching"

// Mock helper functions to create AST nodes for testing
function createCallExpressionNode(options: {
  type: "Identifier" | "MemberExpression"
  name?: string
  object?: string
  property?: string
}): CallExpressionNode {
  if (options.type === "Identifier") {
    return {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: options.name || "test",
      },
    } as CallExpressionNode
  }

  return {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: options.object || "obj",
      },
      property: {
        type: "Identifier",
        name: options.property || "method",
      },
    },
  } as CallExpressionNode
}

function createTaggedTemplateNode(options: {
  type: "Identifier" | "MemberExpression"
  name?: string
  object?: string
  property?: string
}): TaggedTemplateNode {
  if (options.type === "Identifier") {
    return {
      type: "TaggedTemplateExpression",
      tag: {
        type: "Identifier",
        name: options.name || "test",
      },
    } as TaggedTemplateNode
  }

  return {
    type: "TaggedTemplateExpression",
    tag: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: options.object || "obj",
      },
      property: {
        type: "Identifier",
        name: options.property || "method",
      },
    },
  } as TaggedTemplateNode
}

describe("node-matching", () => {
  describe("isTargetCallee", () => {
    it("should return false when callees array is empty", () => {
      const node = createCallExpressionNode({
        type: "Identifier",
        name: "classnames",
      })
      const result = isTargetCallee(node, [])
      expect(result).toBe(false)
    })

    it("should return true for matching simple function call", () => {
      const node = createCallExpressionNode({
        type: "Identifier",
        name: "classnames",
      })
      const result = isTargetCallee(node, ["classnames", "clsx"])
      expect(result).toBe(true)
    })

    it("should return false for non-matching simple function call", () => {
      const node = createCallExpressionNode({
        type: "Identifier",
        name: "someOtherFunction",
      })
      const result = isTargetCallee(node, ["classnames", "clsx"])
      expect(result).toBe(false)
    })

    it("should return true for matching member expression call", () => {
      const node = createCallExpressionNode({
        type: "MemberExpression",
        object: "utils",
        property: "classnames",
      })
      const result = isTargetCallee(node, ["classnames", "clsx"])
      expect(result).toBe(true)
    })

    it("should return false for non-matching member expression call", () => {
      const node = createCallExpressionNode({
        type: "MemberExpression",
        object: "utils",
        property: "someOtherMethod",
      })
      const result = isTargetCallee(node, ["classnames", "clsx"])
      expect(result).toBe(false)
    })

    it("should handle multiple callees", () => {
      const classNamesNode = createCallExpressionNode({
        type: "Identifier",
        name: "classnames",
      })
      const clsxNode = createCallExpressionNode({
        type: "Identifier",
        name: "clsx",
      })
      const cvaNode = createCallExpressionNode({
        type: "Identifier",
        name: "cva",
      })
      const unknownNode = createCallExpressionNode({
        type: "Identifier",
        name: "unknown",
      })

      const callees = ["classnames", "clsx", "cva"]

      expect(isTargetCallee(classNamesNode, callees)).toBe(true)
      expect(isTargetCallee(clsxNode, callees)).toBe(true)
      expect(isTargetCallee(cvaNode, callees)).toBe(true)
      expect(isTargetCallee(unknownNode, callees)).toBe(false)
    })

    it("should handle case-sensitive matching", () => {
      const node = createCallExpressionNode({
        type: "Identifier",
        name: "ClassNames",
      })
      const result = isTargetCallee(node, ["classnames"])
      expect(result).toBe(false)
    })

    it("should handle complex member expressions", () => {
      const node = createCallExpressionNode({
        type: "MemberExpression",
        object: "styled",
        property: "div",
      })
      const result = isTargetCallee(node, ["div"])
      expect(result).toBe(true)
    })
  })

  describe("isTargetTag", () => {
    it("should return false when tags array is empty", () => {
      const node = createTaggedTemplateNode({
        type: "Identifier",
        name: "tw",
      })
      const result = isTargetTag(node, [])
      expect(result).toBe(false)
    })

    it("should return true for matching simple tag", () => {
      const node = createTaggedTemplateNode({
        type: "Identifier",
        name: "tw",
      })
      const result = isTargetTag(node, ["tw", "styled"])
      expect(result).toBe(true)
    })

    it("should return false for non-matching simple tag", () => {
      const node = createTaggedTemplateNode({
        type: "Identifier",
        name: "someOtherTag",
      })
      const result = isTargetTag(node, ["tw", "styled"])
      expect(result).toBe(false)
    })

    it("should return true for matching member expression tag", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "styled",
        property: "div",
      })
      const result = isTargetTag(node, ["div"])
      expect(result).toBe(true)
    })

    it("should return false for non-matching member expression tag", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "styled",
        property: "span",
      })
      const result = isTargetTag(node, ["div"])
      expect(result).toBe(false)
    })

    it("should handle multiple tags", () => {
      const twNode = createTaggedTemplateNode({
        type: "Identifier",
        name: "tw",
      })
      const styledNode = createTaggedTemplateNode({
        type: "Identifier",
        name: "styled",
      })
      const myTagNode = createTaggedTemplateNode({
        type: "Identifier",
        name: "myTag",
      })
      const unknownNode = createTaggedTemplateNode({
        type: "Identifier",
        name: "unknown",
      })

      const tags = ["tw", "styled", "myTag"]

      expect(isTargetTag(twNode, tags)).toBe(true)
      expect(isTargetTag(styledNode, tags)).toBe(true)
      expect(isTargetTag(myTagNode, tags)).toBe(true)
      expect(isTargetTag(unknownNode, tags)).toBe(false)
    })

    it("should handle case-sensitive matching", () => {
      const node = createTaggedTemplateNode({
        type: "Identifier",
        name: "TW",
      })
      const result = isTargetTag(node, ["tw"])
      expect(result).toBe(false)
    })

    it("should handle complex member expressions", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "myTag",
        property: "subTag",
      })
      const result = isTargetTag(node, ["subTag"])
      expect(result).toBe(true)
    })
  })

  describe("edge cases", () => {
    it("should handle empty function name gracefully", () => {
      const node = createCallExpressionNode({
        type: "Identifier",
        name: "",
      })
      const result = isTargetCallee(node, ["classnames"])
      expect(result).toBe(false)
    })

    it("should handle empty tag name gracefully", () => {
      const node = createTaggedTemplateNode({
        type: "Identifier",
        name: "",
      })
      const result = isTargetTag(node, ["tw"])
      expect(result).toBe(false)
    })

    it("should handle empty callees array with member expression", () => {
      const node = createCallExpressionNode({
        type: "MemberExpression",
        object: "utils",
        property: "classnames",
      })
      const result = isTargetCallee(node, [])
      expect(result).toBe(false)
    })

    it("should handle empty tags array with member expression", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "styled",
        property: "div",
      })
      const result = isTargetTag(node, [])
      expect(result).toBe(false)
    })
  })
})
