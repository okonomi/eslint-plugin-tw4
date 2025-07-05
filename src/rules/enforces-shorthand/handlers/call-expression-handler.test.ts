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
const { isTargetCallee } = await import("../utils/node-matching")

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
    handler = new CallExpressionHandler(mockContext, callees, undefined)
  })

  describe("control flow - essential branching logic", () => {
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

      expect(processClassNames).not.toHaveBeenCalled()
    })

    it("should delegate string literal processing", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [
          {
            type: "Literal",
            value: "test-classes",
          },
        ],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processClassNames).toHaveBeenCalledWith("test-classes", undefined)
    })

    it("should delegate template literal processing", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const templateLiteral = {
        type: "TemplateLiteral",
        quasis: [],
        expressions: [],
      }

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [templateLiteral],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processTemplateLiteral).toHaveBeenCalledWith(
        templateLiteral,
        mockContext,
        undefined,
      )
    })

    it("should delegate array expression processing", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const arrayExpression = {
        type: "ArrayExpression",
        elements: [],
      }

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [arrayExpression],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processNestedStructure).toHaveBeenCalledWith(
        arrayExpression,
        mockContext,
        undefined,
      )
    })

    it("should delegate object expression processing", () => {
      vi.mocked(isTargetCallee).mockReturnValue(true)

      const objectExpression = {
        type: "ObjectExpression",
        properties: [],
      }

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "cn" },
        arguments: [objectExpression],
      } as unknown as TSESTree.CallExpression

      handler.handle(node)

      expect(processNestedStructure).toHaveBeenCalledWith(
        objectExpression,
        mockContext,
        undefined,
      )
    })
  })
})
