import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { processJSXAttribute } from "./jsx-processor"

// Mock the dependencies
vi.mock("./class-processor", () => ({
  processClassNames: vi.fn(),
}))

vi.mock("./template-processor", () => ({
  processTemplateLiteral: vi.fn(),
}))

const { processClassNames } = await import("./class-processor")
const { processTemplateLiteral } = await import("./template-processor")

describe("jsx-processor", () => {
  const mockContext = {
    report: vi.fn(),
    // Add other required context properties
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("processJSXAttribute", () => {
    it("should ignore non-className and non-class attributes", () => {
      const node = {
        name: { name: "id" },
        value: {
          type: "Literal",
          value: "test-id",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(mockContext.report).not.toHaveBeenCalled()
    })

    it("should ignore attributes without values", () => {
      const node = {
        name: { name: "className" },
        value: null,
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(mockContext.report).not.toHaveBeenCalled()
    })

    it("should process className attribute with string literal", () => {
      const mockResult = {
        applied: true,
        value: "m-4",
        transformations: [
          {
            shorthand: "m-4",
            classnames: "mt-4, mr-4, mb-4, ml-4",
          },
        ],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "mt-4 mr-4 mb-4 ml-4",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4", undefined)
      expect(mockContext.report).toHaveBeenCalledWith({
        node: node.value,
        messageId: "useShorthand",
        data: {
          shorthand: "m-4",
          classnames: "mt-4, mr-4, mb-4, ml-4",
        },
        fix: expect.any(Function),
      })
    })

    it("should process class attribute with string literal", () => {
      const mockResult = {
        applied: true,
        value: "p-2",
        transformations: [
          {
            shorthand: "p-2",
            classnames: "pt-2, pr-2, pb-2, pl-2",
          },
        ],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "class" },
        value: {
          type: "Literal",
          value: "pt-2 pr-2 pb-2 pl-2",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("pt-2 pr-2 pb-2 pl-2", undefined)
      expect(mockContext.report).toHaveBeenCalledWith({
        node: node.value,
        messageId: "useShorthand",
        data: {
          shorthand: "p-2",
          classnames: "pt-2, pr-2, pb-2, pl-2",
        },
        fix: expect.any(Function),
      })
    })

    it("should handle multiple transformations", () => {
      const mockResult = {
        applied: true,
        value: "m-4 p-2",
        transformations: [
          {
            shorthand: "m-4",
            classnames: "mt-4, mr-4, mb-4, ml-4",
          },
          {
            shorthand: "p-2",
            classnames: "pt-2, pr-2, pb-2, pl-2",
          },
        ],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "mt-4 mr-4 mb-4 ml-4 pt-2 pr-2 pb-2 pl-2",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(mockContext.report).toHaveBeenCalledTimes(2)
    })

    it("should handle redundancy removal cases", () => {
      const mockResult = {
        applied: true,
        value: "flex items-center", // Removed duplicate
        transformations: [],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "flex items-center items-center",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(mockContext.report).toHaveBeenCalledWith({
        node: node.value,
        messageId: "useShorthand",
        data: {
          shorthand: "flex items-center",
          classnames: "flex, items-center, items-center",
        },
        fix: expect.any(Function),
      })
    })

    it("should process template literal in JSXExpressionContainer", () => {
      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        name: { name: "className" },
        value: {
          type: "JSXExpressionContainer",
          expression: templateLiteral,
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should ignore non-string literal values", () => {
      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: 123, // number instead of string
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(mockContext.report).not.toHaveBeenCalled()
    })

    it("should not report when no transformations applied", () => {
      const mockResult = {
        applied: false,
        value: "flex items-center",
        transformations: [],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "flex items-center",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).toHaveBeenCalled()
      expect(mockContext.report).not.toHaveBeenCalled()
    })

    it("should generate correct fix for className attribute", () => {
      const mockResult = {
        applied: true,
        value: "m-4",
        transformations: [
          {
            shorthand: "m-4",
            classnames: "mt-4, mr-4, mb-4, ml-4",
          },
        ],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "mt-4 mr-4 mb-4 ml-4",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      const reportCall = vi.mocked(mockContext.report).mock.calls[0][0]
      expect(reportCall.fix).toBeDefined()
      expect(typeof reportCall.fix).toBe("function")
    })

    it("should generate correct fix for class attribute", () => {
      const mockResult = {
        applied: true,
        value: "p-2",
        transformations: [
          {
            shorthand: "p-2",
            classnames: "pt-2, pr-2, pb-2, pl-2",
          },
        ],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "class" },
        value: {
          type: "Literal",
          value: "pt-2 pr-2 pb-2 pl-2",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      const reportCall = vi.mocked(mockContext.report).mock.calls[0][0]
      expect(reportCall.fix).toBeDefined()
      expect(typeof reportCall.fix).toBe("function")
    })
  })
})
