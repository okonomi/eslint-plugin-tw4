import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TaggedTemplateHandler } from "./tagged-template-handler"

// Mock the dependencies
vi.mock("../processors/templates", () => ({
  processTemplateLiteral: vi.fn(),
}))

vi.mock("../utils/node-matching", () => ({
  isTargetTag: vi.fn(),
}))

const { processTemplateLiteral } = await import("../processors/templates")
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

  describe("control flow - essential branching logic", () => {
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
        quasis: [],
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
  })
})
