import type { TSESTree } from "@typescript-eslint/utils"
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { handleJSXAttribute } from "./jsx-attributes"

// Mock the dependencies
vi.mock("../processors/jsx", () => ({
  processJSXAttribute: vi.fn(),
}))

const { processJSXAttribute } = await import("../processors/jsx")

describe("handleJSXAttribute", () => {
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

      handleJSXAttribute(node, mockContext, undefined)

      expect(processJSXAttribute).toHaveBeenCalledWith(
        node,
        mockContext,
        undefined,
      )
      expect(processJSXAttribute).toHaveBeenCalledTimes(1)
    })
  })
})
