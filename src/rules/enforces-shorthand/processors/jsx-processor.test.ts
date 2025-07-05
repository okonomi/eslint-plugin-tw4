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
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("control flow - essential branching logic", () => {
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

    it("should delegate template literal processing", () => {
      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [],
        expressions: [],
      }

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

    it("should process string literal values", () => {
      const mockResult = {
        applied: true,
        value: "processed-classes",
        transformations: [
          {
            shorthand: "processed-classes",
            classnames: "original-classes",
          },
        ],
      }

      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "original-classes",
        },
      } as unknown as TSESTree.JSXAttribute

      processJSXAttribute(node, mockContext)

      expect(processClassNames).toHaveBeenCalledWith(
        "original-classes",
        undefined,
      )
      expect(mockContext.report).toHaveBeenCalled()
    })
  })
})
