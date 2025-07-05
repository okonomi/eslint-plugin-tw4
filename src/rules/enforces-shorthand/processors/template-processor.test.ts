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

  describe("control flow - essential branching logic", () => {
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
    })

    it("should process simple template literal with static content", () => {
      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [],
        quasis: [
          {
            value: {
              cooked: "test-classes",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).toHaveBeenCalledWith("test-classes", undefined)
    })

    it("should process template literal with expressions for static parts only", () => {
      vi.mocked(processClassNames).mockReturnValue({
        applied: false,
        value: "test-classes",
        transformations: [],
      })

      const templateLiteral = {
        type: "TemplateLiteral",
        expressions: [{}], // has expressions
        quasis: [
          {
            value: {
              cooked: "before-classes",
            },
          },
          {
            value: {
              cooked: "after-classes",
            },
          },
        ],
      } as unknown as TSESTree.TemplateLiteral

      processTemplateLiteral(templateLiteral, mockContext)

      expect(processClassNames).toHaveBeenCalledWith(
        "before-classes",
        undefined,
      )
      expect(processClassNames).toHaveBeenCalledWith("after-classes", undefined)
    })
  })
})
