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
  type: "Identifier" | "MemberExpression" | "CallExpression"
  name?: string
  object?: string
  property?: string
  callee?: string
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

  if (options.type === "CallExpression") {
    return {
      type: "TaggedTemplateExpression",
      tag: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: options.callee || "test",
        },
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

    describe("member expression object matching", () => {
      it("should match by object name in member expression", () => {
        const node = createTaggedTemplateNode({
          type: "MemberExpression",
          object: "myTag",
          property: "subTag",
        })
        const result = isTargetTag(node, ["myTag"])
        expect(result).toBe(true)
      })

      it("should prioritize property name over object name", () => {
        const node = createTaggedTemplateNode({
          type: "MemberExpression",
          object: "notInTags",
          property: "myTag",
        })
        const result = isTargetTag(node, ["myTag"])
        expect(result).toBe(true)
      })

      it("should match both object and property names", () => {
        const node = createTaggedTemplateNode({
          type: "MemberExpression",
          object: "styled",
          property: "div",
        })
        // Should match both "styled" (object) and "div" (property)
        expect(isTargetTag(node, ["styled"])).toBe(true)
        expect(isTargetTag(node, ["div"])).toBe(true)
        expect(isTargetTag(node, ["styled", "div"])).toBe(true)
      })

      it("should return false when neither object nor property matches", () => {
        const node = createTaggedTemplateNode({
          type: "MemberExpression",
          object: "other",
          property: "span",
        })
        const result = isTargetTag(node, ["myTag", "div"])
        expect(result).toBe(false)
      })
    })

    describe("call expression tagged templates", () => {
      it("should match call expression by callee name", () => {
        const node = createTaggedTemplateNode({
          type: "CallExpression",
          callee: "myTag",
        })
        const result = isTargetTag(node, ["myTag"])
        expect(result).toBe(true)
      })

      it("should return false for non-matching call expression", () => {
        const node = createTaggedTemplateNode({
          type: "CallExpression",
          callee: "someOtherFunction",
        })
        const result = isTargetTag(node, ["myTag"])
        expect(result).toBe(false)
      })

      it("should handle multiple call expression tags", () => {
        const styledNode = createTaggedTemplateNode({
          type: "CallExpression",
          callee: "styled",
        })
        const twNode = createTaggedTemplateNode({
          type: "CallExpression",
          callee: "tw",
        })
        const unknownNode = createTaggedTemplateNode({
          type: "CallExpression",
          callee: "unknown",
        })

        const tags = ["styled", "tw", "myTag"]

        expect(isTargetTag(styledNode, tags)).toBe(true)
        expect(isTargetTag(twNode, tags)).toBe(true)
        expect(isTargetTag(unknownNode, tags)).toBe(false)
      })

      it("should handle case-sensitive matching for call expressions", () => {
        const node = createTaggedTemplateNode({
          type: "CallExpression",
          callee: "MyTag",
        })
        const result = isTargetTag(node, ["myTag"])
        expect(result).toBe(false)
      })
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

    it("should handle empty tags array with call expression", () => {
      const node = createTaggedTemplateNode({
        type: "CallExpression",
        callee: "myTag",
      })
      const result = isTargetTag(node, [])
      expect(result).toBe(false)
    })

    it("should handle empty callee name in call expression", () => {
      const node = createTaggedTemplateNode({
        type: "CallExpression",
        callee: "",
      })
      const result = isTargetTag(node, ["myTag"])
      expect(result).toBe(false)
    })

    it("should handle empty object and property names in member expression", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "",
        property: "",
      })
      const result = isTargetTag(node, ["myTag"])
      expect(result).toBe(false)
    })

    it("should handle member expression with empty object name", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "",
        property: "myTag",
      })
      const result = isTargetTag(node, ["myTag"])
      expect(result).toBe(true)
    })

    it("should handle member expression with empty property name", () => {
      const node = createTaggedTemplateNode({
        type: "MemberExpression",
        object: "myTag",
        property: "",
      })
      const result = isTargetTag(node, ["myTag"])
      expect(result).toBe(true)
    })
  })
})
