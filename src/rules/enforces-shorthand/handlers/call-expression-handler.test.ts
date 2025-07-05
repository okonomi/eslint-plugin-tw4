import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CallExpressionHandler } from "./call-expression-handler"

// Mock the dependencies
vi.mock("../processors/class-processor", () => ({
  processClassNames: vi.fn(),
}))

vi.mock("../processors/nested-structure-processor", () => ({
  processNestedStructure: vi.fn(),
}))

vi.mock("../processors/template-processor", () => ({
  processTemplateLiteral: vi.fn(),
}))

vi.mock("../utils/error-reporter", () => ({
  reportErrors: vi.fn(),
}))

vi.mock("../utils/node-matching", () => ({
  isTargetCallee: vi.fn(),
}))

vi.mock("../utils/quote-utils", () => ({
  wrapWithQuotesFromContext: vi.fn((value: string) => `"${value}"`),
}))

const { processClassNames } = await import("../processors/class-processor")
const { processNestedStructure } = await import(
  "../processors/nested-structure-processor"
)
const { processTemplateLiteral } = await import(
  "../processors/template-processor"
)
const { reportErrors } = await import("../utils/error-reporter")
const { isTargetCallee } = await import("../utils/node-matching")
const { wrapWithQuotesFromContext } = await import("../utils/quote-utils")

describe("call-expression-handler", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  const callees = ["cn", "clsx", "classNames"]
  let handler: CallExpressionHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new CallExpressionHandler(mockContext, callees)
  })

  describe("handle", () => {
    it("should ignore non-target function calls", () => {
      vi.mocked(isTargetCallee).mockReturnValue(false)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "otherFunction" },
        arguments: [],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(isTargetCallee).toHaveBeenCalledWith(node, callees)
      expect(processClassNames).not.toHaveBeenCalled()
      expect(processNestedStructure).not.toHaveBeenCalled()
      expect(processTemplateLiteral).not.toHaveBeenCalled()
    })

    it("should ignore target function calls with no arguments", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(isTargetCallee).toHaveBeenCalledWith(node, callees)
      expect(processClassNames).not.toHaveBeenCalled()
      expect(processNestedStructure).not.toHaveBeenCalled()
      expect(processTemplateLiteral).not.toHaveBeenCalled()
    })

    it("should process string literal first argument", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)
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
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [
          {
            type: "Literal",
            value: "mt-4 mr-4 mb-4 ml-4",
          },
        ],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4")
      expect(wrapWithQuotesFromContext).toHaveBeenCalledWith(
        "mt-4 mr-4 mb-4 ml-4",
        mockContext,
      )
      expect(reportErrors).toHaveBeenCalledWith(mockContext, {
        targetNode: node.arguments[0],
        fixText: '"mt-4 mr-4 mb-4 ml-4"',
        originalValue: "mt-4 mr-4 mb-4 ml-4",
        result: mockResult,
      })
    })

    it("should ignore non-string literal first argument", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [
          {
            type: "Literal",
            value: 123, // number instead of string
          },
        ],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(reportErrors).not.toHaveBeenCalled()
    })

    it("should process template literal first argument", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [],
        expressions: [],
      } as unknown as TSESTree.TemplateLiteral

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [templateLiteral],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
      )
    })

    it("should process array expression first argument", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const arrayExpression = {
        type: "ArrayExpression",
        elements: [],
      } as unknown as TSESTree.ArrayExpression

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [arrayExpression],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processNestedStructure).toHaveBeenCalledWith(
        arrayExpression,
        mockContext,
      )
    })

    it("should process object expression first argument", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const objectExpression = {
        type: "ObjectExpression",
        properties: [],
      } as unknown as TSESTree.ObjectExpression

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [objectExpression],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processNestedStructure).toHaveBeenCalledWith(
        objectExpression,
        mockContext,
      )
    })

    it("should ignore unsupported first argument types", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [
          {
            type: "Identifier",
            name: "someVariable",
          },
        ],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processClassNames).not.toHaveBeenCalled()
      expect(processNestedStructure).not.toHaveBeenCalled()
      expect(processTemplateLiteral).not.toHaveBeenCalled()
      expect(reportErrors).not.toHaveBeenCalled()
    })

    it("should handle multiple arguments by processing only the first", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)
      const mockResult = { applied: false, value: "flex", transformations: [] }
      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [
          {
            type: "Literal",
            value: "flex",
          },
          {
            type: "Literal",
            value: "items-center",
          },
        ],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processClassNames).toHaveBeenCalledTimes(1)
      expect(processClassNames).toHaveBeenCalledWith("flex")
    })

    it("should handle complex CVA-like object patterns", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const complexObject = {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            key: { type: "Literal", value: "variants" },
            value: {
              type: "ObjectExpression",
              properties: [],
            },
          },
        ],
      } as unknown as TSESTree.ObjectExpression

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cva" },
        arguments: [complexObject],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processNestedStructure).toHaveBeenCalledWith(
        complexObject,
        mockContext,
      )
    })

    it("should validate isTargetCallee is called with correct parameters", () => {
      vi.mocked(isTargetCallee).mockReturnValue(false)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "nonTarget" },
        arguments: [],
      } as unknown as TSESTree.CallExpression

      const customCallees = ["customFn", "anotherFn"]
      const customHandler = new CallExpressionHandler(
        mockContext,
        customCallees,
      )

      customHandler.handle(node)

      expect(isTargetCallee).toHaveBeenCalledWith(node, customCallees)
    })

    it("should handle string literal with wrapWithQuotesFromContext correctly", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)
      vi.mocked(wrapWithQuotesFromContext).mockReturnValue("'custom-quotes'")
      const mockResult = { applied: true, value: "test", transformations: [] }
      vi.mocked(processClassNames).mockReturnValue(mockResult)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [
          {
            type: "Literal",
            value: "test-class",
          },
        ],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(wrapWithQuotesFromContext).toHaveBeenCalledWith(
        "test-class",
        mockContext,
      )
      expect(reportErrors).toHaveBeenCalledWith(mockContext, {
        targetNode: node.arguments[0],
        fixText: "'custom-quotes'",
        originalValue: "test-class",
        result: mockResult,
      })
    })
  })
})
