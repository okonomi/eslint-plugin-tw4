import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { handleCallExpression } from "./call-expressions"

// Mock the dependencies
vi.mock("../processors/classes", () => ({
  processClassNames: vi.fn(),
}))

vi.mock("../processors/nested", () => ({
  processNestedStructure: vi.fn(),
}))

vi.mock("../processors/templates", () => ({
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

const { processClassNames } = await import("../processors/classes")
const { processNestedStructure } = await import("../processors/nested")
const { processTemplateLiteral } = await import("../processors/templates")
const { isTargetCallee } = await import("../utils/node-matching")

describe("handleCallExpression", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  const callees = ["cn", "clsx", "classNames"]
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("control flow - essential branching logic", () => {
    it("should ignore non-target function calls", () => {
      vi.mocked(isTargetCallee).mockReturnValue(false)

      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "otherFunction" },
        arguments: [],
      } as unknown as TSESTree.CallExpression

      handleCallExpression(node, mockContext, callees, undefined)

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

      handleCallExpression(node, mockContext, callees, undefined)

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

      handleCallExpression(node, mockContext, callees, undefined)

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

      handleCallExpression(node, mockContext, callees, undefined)

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

      handleCallExpression(node, mockContext, callees, undefined)

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

      handleCallExpression(node, mockContext, callees, undefined)

      expect(processNestedStructure).toHaveBeenCalledWith(
        objectExpression,
        mockContext,
        undefined,
      )
    })
  })
})
