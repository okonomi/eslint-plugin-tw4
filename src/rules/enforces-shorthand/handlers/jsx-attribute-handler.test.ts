import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { JSXAttributeHandler } from "./jsx-attribute-handler"

// Mock the dependencies
vi.mock("../processors/jsx-processor", () => ({
  processJSXAttribute: vi.fn(),
}))

const { processJSXAttribute } = await import("../processors/jsx-processor")

describe("jsx-attribute-handler", () => {
  const mockContext = {
    report: vi.fn(),
    parserPath: "test",
    parserOptions: {},
    settings: {},
    getFilename: vi.fn(() => "test.tsx"),
    getSourceCode: vi.fn(),
  } as unknown as RuleContext<"useShorthand", readonly unknown[]>

  let handler: JSXAttributeHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new JSXAttributeHandler(mockContext, undefined)
  })

  describe("delegation - essential functionality", () => {
    it("should delegate to processJSXAttribute", () => {
      const node = {
        type: "JSXAttribute",
        name: { name: "className" },
        value: {
          type: "Literal",
          value: "test-classes",
        },
      } as unknown as TSESTree.JSXAttribute

      handler.handle(node)

      expect(processJSXAttribute).toHaveBeenCalledWith(node, mockContext, undefined)
      expect(processJSXAttribute).toHaveBeenCalledTimes(1)
    })
  })
})