import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { processNestedStructure } from "./nested-structure-processor"

// Mock the dependencies
vi.mock("./class-processor", () => ({
  processClassNames: vi.fn(),
}))

vi.mock("../utils/error-reporter", () => ({
  reportErrors: vi.fn(),
}))

const { processClassNames } = await import("./class-processor")

describe("nested-structure-processor", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(() => ({
      getText: vi.fn((node) => {
        if (node.type === "Literal" && typeof node.value === "string") {
          return `"${node.value}"`
        }
        if (node.type === "Identifier") {
          return `"${node.name}"`
        }
        return `"${node.value || node.name || "unknown"}"`
      }),
    })),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("control flow - essential branching logic", () => {
    it("should process string literals in array elements", () => {
      const arrayNode = {
        type: "ArrayExpression",
        elements: [
          {
            type: "Literal",
            value: "test-classes",
          },
        ],
      } as unknown as TSESTree.ArrayExpression

      processNestedStructure(arrayNode, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("test-classes", undefined)
    })

    it("should ignore non-string literals in array elements", () => {
      const arrayNode = {
        type: "ArrayExpression",
        elements: [
          {
            type: "Literal",
            value: 123, // number
          },
          {
            type: "Literal",
            value: true, // boolean
          },
        ],
      } as unknown as TSESTree.ArrayExpression

      processNestedStructure(arrayNode, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
    })

    it("should process string literal keys in object properties", () => {
      const objectNode = {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            computed: false,
            key: {
              type: "Literal",
              value: "test-classes",
            },
            value: {
              type: "Literal",
              value: true,
            },
          },
        ],
      } as unknown as TSESTree.ObjectExpression

      processNestedStructure(objectNode, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("test-classes", undefined)
    })

    it("should ignore computed keys in object properties", () => {
      const objectNode = {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            computed: true,
            key: {
              type: "Identifier",
              name: "variable",
            },
            value: {
              type: "Literal",
              value: true,
            },
          },
        ],
      } as unknown as TSESTree.ObjectExpression

      processNestedStructure(objectNode, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
    })

    it("should handle empty structures", () => {
      const arrayNode = {
        type: "ArrayExpression",
        elements: [],
      } as unknown as TSESTree.ArrayExpression

      const objectNode = {
        type: "ObjectExpression",
        properties: [],
      } as unknown as TSESTree.ObjectExpression

      processNestedStructure(arrayNode, mockContext)
      processNestedStructure(objectNode, mockContext)

      expect(processClassNames).not.toHaveBeenCalled()
    })
  })
})