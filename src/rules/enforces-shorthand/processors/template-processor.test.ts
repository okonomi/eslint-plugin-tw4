import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { processTemplateLiteral } from "./template-processor"

// Mock the dependencies
vi.mock("./class-processor", () => ({
  processClassNames: vi.fn(),
}))

vi.mock("../utils/error-reporter", () => ({
  reportErrors: vi.fn(),
}))

const { processClassNames } = await import("./class-processor")
const { reportErrors } = await import("../utils/error-reporter")

describe("template-processor", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("processTemplateLiteral", () => {
    it("should process simple template literal with static content", () => {
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

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [],
        quasis: [
          {
            value: {
              cooked: "mt-4 mr-4 mb-4 ml-4",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4", undefined)
      expect(reportErrors).toHaveBeenCalledWith(mockContext, {
        targetNode: templateLiteral,
        fixText: "`mt-4 mr-4 mb-4 ml-4`",
        originalValue: "mt-4 mr-4 mb-4 ml-4",
        result: mockResult,
      })
    })

    it("should ignore template literal with no static content", () => {
      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [],
        quasis: [
          {
            value: {
              cooked: null,
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(reportErrors).not.toHaveBeenCalled()
    })

    it("should ignore template literal with empty static content", () => {
      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [],
        quasis: [
          {
            value: {
              cooked: "",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(reportErrors).not.toHaveBeenCalled()
    })

    it("should process template literal with expressions for static parts only", () => {
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

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}], // Has expressions
        quasis: [
          {
            value: {
              cooked: "mt-4 mr-4 mb-4 ml-4",
            },
          },
          {
            value: {
              cooked: " pt-2 pr-2 pb-2 pl-2",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).toHaveBeenCalledTimes(2)
      expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4", undefined)
      expect(processClassNames).toHaveBeenCalledWith(" pt-2 pr-2 pb-2 pl-2", undefined)
    })

    it("should report errors for complex template literals with transformations", () => {
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

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}], // Has expressions
        quasis: [
          {
            value: {
              cooked: "mt-4 mr-4 mb-4 ml-4",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(mockContext.report).toHaveBeenCalledWith({
        node: templateLiteral,
        messageId: "useShorthand",
        data: {
          shorthand: "m-4",
          classnames: "mt-4, mr-4, mb-4, ml-4",
        },
        fix: expect.any(Function),
      })
    })

    it("should process empty or whitespace-only static parts in complex templates", () => {
      const mockResult = {
        applied: false,
        value: "",
        transformations: [],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}],
        quasis: [
          {
            value: {
              cooked: "   ", // Only whitespace
            },
          },
          {
            value: {
              cooked: "", // Empty
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      // Now the implementation processes all static parts, including empty ones
      expect(processClassNames).toHaveBeenCalledWith("   ", undefined)
      expect(processClassNames).toHaveBeenCalledWith("", undefined)
      expect(mockContext.report).not.toHaveBeenCalled() // No transformations applied
    })

    it("should not report when no transformations are applied in complex templates", () => {
      const mockResult = {
        applied: false,
        value: "flex items-center",
        transformations: [],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}],
        quasis: [
          {
            value: {
              cooked: "flex items-center",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("flex items-center", undefined)
      expect(mockContext.report).not.toHaveBeenCalled()
    })

    it("should handle multiple transformations in complex templates", () => {
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

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}],
        quasis: [
          {
            value: {
              cooked: "mt-4 mr-4 mb-4 ml-4 pt-2 pr-2 pb-2 pl-2",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(mockContext.report).toHaveBeenCalledTimes(2)
    })

    it("should handle template literal with null cooked value in complex case", () => {
      const mockResult = {
        applied: false,
        value: "",
        transformations: [],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}],
        quasis: [
          {
            value: {
              cooked: null,
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      // Null is converted to empty string by the implementation
      expect(processClassNames).toHaveBeenCalledWith("", undefined)
      expect(mockContext.report).not.toHaveBeenCalled()
    })

    it("should handle no transformations in simple template literal", () => {
      const mockResult = {
        applied: false,
        value: "flex items-center",
        transformations: [],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [],
        quasis: [
          {
            value: {
              cooked: "flex items-center",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("flex items-center", undefined)
      expect(reportErrors).toHaveBeenCalledWith(mockContext, {
        targetNode: templateLiteral,
        fixText: "`flex items-center`",
        originalValue: "flex items-center",
        result: mockResult,
      })
    })
  })
})
