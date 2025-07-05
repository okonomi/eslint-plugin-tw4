import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { JSXAttributeHandler } from "./jsx-attribute-handler"

// Mock the dependencies
vi.mock("../processors/jsx-processor", () => ({
  processJSXAttribute: vi.fn(),
}))

const { processJSXAttribute } = await import("../processors/jsx-processor")

describe("jsx-attribute-handler", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  let handler: JSXAttributeHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new JSXAttributeHandler(mockContext, undefined)
  })

  describe("handle", () => {
    it("should delegate to processJSXAttribute", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "test-class",
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
      expect(processJSXAttribute).toHaveBeenCalledTimes(1)
    })

    it("should handle className attribute", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "mt-4 mr-4 mb-4 ml-4",
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should handle class attribute", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "class" },
        value: {
          type: "Literal",
          value: "pt-2 pr-2 pb-2 pl-2",
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should handle JSX expression container", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: {
          type: "JSXExpressionContainer",
          expression: {
            type: "TemplateLiteral",
            quasis: [],
            expressions: [],
          },
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should handle attributes without values", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: null,
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should handle non-className attributes", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "id" },
        value: {
          type: "Literal",
          value: "test-id",
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should pass through complex JSX attribute structures", () => {
      const node = {
        type: "JSXAttribute",
        name: {
          type: "JSXIdentifier",
          name: "className",
        },
        value: {
          type: "JSXExpressionContainer",
          expression: {
            type: "ConditionalExpression",
            test: {
              type: "Identifier",
              name: "condition",
            },
            consequent: {
              type: "Literal",
              value: "mt-4 mr-4 mb-4 ml-4",
            },
            alternate: {
              type: "Literal",
              value: "pt-2 pr-2 pb-2 pl-2",
            },
          },
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should handle JSX spread attributes", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: {
          type: "JSXExpressionContainer",
          expression: {
            type: "ObjectExpression",
            properties: [
              {
                type: "Property",
                key: { type: "Literal", value: "mt-4 mr-4 mb-4 ml-4" },
                value: { type: "Literal", value: true },
              },
            ],
          },
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
    })

    it("should maintain handler state correctly across multiple calls", () => {
      const node1 = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: { type: "Literal", value: "first-class" },
      } as unknown as TSESTree.JSXAttribute

      const node2 = {
        type: "JSXAttribute",
        name: { name: "class" },
        value: { type: "Literal", value: "second-class" },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node1)
      handler.handle(node2)

      expect(processJSXAttribute).toHaveBeenCalledTimes(2)
      expect(processJSXAttribute).toHaveBeenNthCalledWith(1, node1, mockContext, undefined)
      expect(processJSXAttribute).toHaveBeenNthCalledWith(2, node2, mockContext, undefined)
    })

    it("should work with different handler instances", () => {
      const handler2 = new JSXAttributeHandler(mockContext, undefined)

      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: { type: "Literal", value: "test" },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)
      handler2.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledTimes(2)
    })
  })
})
