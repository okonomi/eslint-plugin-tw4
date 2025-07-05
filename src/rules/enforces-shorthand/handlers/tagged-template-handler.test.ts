import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TaggedTemplateHandler } from "./tagged-template-handler"

// Mock the dependencies
vi.mock("../processors/template-processor", () => ({
  processTemplateLiteral: vi.fn(),
}))

vi.mock("../utils/node-matching", () => ({
  isTargetTag: vi.fn(),
}))

const { processTemplateLiteral } = await import(
  "../processors/template-processor"
)
const { isTargetTag } = await import("../utils/node-matching")

describe("tagged-template-handler", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  const tags = ["tw", "css", "styled"]
  let handler: TaggedTemplateHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new TaggedTemplateHandler(mockContext, tags, undefined)
  })

  describe("handle", () => {
    it("should ignore non-target tagged templates", () => {
      vi.mocked(isTargetTag).mockReturnValue(false)

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "nonTarget" },
        quasi: {
          type: "TemplateLiteral",
          quasis: [],
          expressions: [],
        },
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(isTargetTag).toHaveBeenCalledWith(node, tags)
      expect(processTemplateLiteral).not.toHaveBeenCalled()
    })

    it("should process target tagged template expressions", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "mt-4 mr-4 mb-4 ml-4",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "tw" },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(isTargetTag).toHaveBeenCalledWith(node, tags)
      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should handle tw tagged template", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "pt-2 pr-2 pb-2 pl-2",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "tw" },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should handle css tagged template", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "border-t-2 border-r-2 border-b-2 border-l-2",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "css" },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should handle styled tagged template", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-lg",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "styled" },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should handle template literal with expressions", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "mt-4 mr-4 mb-4 ml-4 ",
            },
          },
          {
            value: {
              cooked: " pt-2 pr-2 pb-2 pl-2",
            },
          },
        ],
        expressions: [
          {
            type: "Identifier",
            name: "dynamicClass",
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "tw" },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should handle member expression tags", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "flex items-center",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: {
          type: "MemberExpression",
          object: { type: "Identifier", name: "styled" },
          property: { type: "Identifier", name: "div" },
        },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(isTargetTag).toHaveBeenCalledWith(node, tags)
      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should validate isTargetTag is called with correct parameters", () => {
      vi.mocked(isTargetTag).mockReturnValue(false)

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "nonTarget" },
        quasi: {
          type: "TemplateLiteral",
          quasis: [],
          expressions: [],
        },
      } as unknown as TSESTree.TaggedTemplateExpression

      const customTags = ["customTag", "anotherTag"]
      const customHandler = new TaggedTemplateHandler(mockContext, customTags)

      customHandler.handle(node)

      expect(isTargetTag).toHaveBeenCalledWith(node, customTags)
    })

    it("should handle empty template literal", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "tw" },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should handle complex nested tag expressions", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [
          {
            value: {
              cooked: "bg-blue-500 hover:bg-blue-600",
            },
          },
        ],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "TaggedTemplateExpression",
        tag: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "tw" },
          arguments: [],
        },
        quasi: templateLiteral,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node)

      expect(isTargetTag).toHaveBeenCalledWith(node, tags)
      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should maintain handler state correctly across multiple calls", () => {
      vi.mocked(isTargetTag).mockReturnValue(true)

      const templateLiteral1 = {
        type: "TemplateLiteral",
        quasis: [{ value: { cooked: "first-class" } }],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const templateLiteral2 = {
        type: "TemplateLiteral",
        quasis: [{ value: { cooked: "second-class" } }],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node1 = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "tw" },
        quasi: templateLiteral1,
      } as unknown as TSESTree.TaggedTemplateExpression

      const node2 = {
        type: "TaggedTemplateExpression",
        tag: { type: "Identifier", name: "css" },
        quasi: templateLiteral2,
      } as unknown as TSESTree.TaggedTemplateExpression

      handler.handle(node1)
      handler.handle(node2)

      expect(processTemplateLiteral).toHaveBeenCalledTimes(2)
      expect(processTemplateLiteral).toHaveBeenNthCalledWith(
        1,
        templateLiteral1,
        mockContext,
        undefined,
      )
      expect(processTemplateLiteral).toHaveBeenNthCalledWith(
        2,
        templateLiteral2,
        mockContext,
        undefined,
      )
    })
  })
})
