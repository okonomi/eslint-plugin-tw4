/** biome-ignore-all lint/suspicious/noExplicitAny: Vue test requires flexible types */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { handleVueAttributes } from "./vue-attributes"

// Simple mocks
vi.mock("../processors/classes", () => ({
  processClassNames: vi.fn(),
}))
vi.mock("./call-expressions", () => ({
  handleCallExpression: vi.fn(),
}))

describe("handleVueAttributes", () => {
  let mockProcessClassNames: any
  let mockHandleCallExpression: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const classesModule = await vi.importMock("../processors/classes")
    const callExpressionsModule = await vi.importMock("./call-expressions")
    mockProcessClassNames = classesModule.processClassNames
    mockHandleCallExpression = callExpressionsModule.handleCallExpression
  })

  it("should handle Vue static class attributes", () => {
    mockProcessClassNames.mockReturnValue({
      applied: true,
      value: "p-4",
      transformations: [{ shorthand: "p-4", classnames: "px-4, py-4" }],
    })

    const mockContext = {
      report: vi.fn(),
      getSourceCode: () => ({
        getText: () => '"px-4 py-4"',
      }),
    } as any

    const vueNode = {
      type: "VAttribute",
      directive: false,
      key: { name: "class" },
      value: { type: "VLiteral", value: "px-4 py-4" },
    }

    const astNode = { children: [vueNode] }

    handleVueAttributes(astNode, mockContext, false, [], undefined)

    expect(mockContext.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node: vueNode,
        messageId: "useShorthand",
        data: { shorthand: "p-4", classnames: "px-4, py-4" },
      }),
    )
  })

  it("should skip when skipClassAttribute is true", () => {
    const mockContext = { report: vi.fn() } as any
    const vueNode = {
      type: "VAttribute",
      key: { name: "class" },
      value: { type: "VLiteral", value: "px-4 py-4" },
    }

    handleVueAttributes(
      { children: [vueNode] },
      mockContext,
      true,
      [],
      undefined,
    )

    expect(mockContext.report).not.toHaveBeenCalled()
  })

  it("should handle Vue dynamic array syntax", () => {
    mockProcessClassNames.mockReturnValue({
      applied: true,
      value: "m-2",
      transformations: [{ shorthand: "m-2", classnames: "mx-2, my-2" }],
    })

    const mockContext = {
      report: vi.fn(),
      getSourceCode: () => ({ getText: () => '"mx-2 my-2"' }),
    } as any

    const element = { type: "Literal", value: "mx-2 my-2" }
    const vueNode = {
      type: "VAttribute",
      directive: true,
      key: { name: "bind", argument: { name: "class" } },
      value: {
        type: "VExpressionContainer",
        expression: { type: "ArrayExpression", elements: [element] },
      },
    }

    handleVueAttributes(
      { children: [vueNode] },
      mockContext,
      false,
      [],
      undefined,
    )

    expect(mockContext.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node: element,
        messageId: "useShorthand",
      }),
    )
  })

  it("should handle Vue dynamic object syntax", () => {
    mockProcessClassNames.mockReturnValue({
      applied: true,
      value: "py-4",
      transformations: [{ shorthand: "py-4", classnames: "pt-4, pb-4" }],
    })

    const mockContext = {
      report: vi.fn(),
      getSourceCode: () => ({ getText: () => '"pt-4 pb-4"' }),
    } as any

    const propertyKey = { type: "Literal", value: "pt-4 pb-4" }
    const property = { type: "Property", key: propertyKey }
    const vueNode = {
      type: "VAttribute",
      directive: true,
      key: { name: "bind", argument: { name: "class" } },
      value: {
        type: "VExpressionContainer",
        expression: { type: "ObjectExpression", properties: [property] },
      },
    }

    handleVueAttributes(
      { children: [vueNode] },
      mockContext,
      false,
      [],
      undefined,
    )

    expect(mockContext.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node: propertyKey,
        messageId: "useShorthand",
      }),
    )
  })

  it("should delegate to handleCallExpression for function calls", () => {
    const mockContext = { report: vi.fn() } as any
    const expression = { type: "CallExpression" }
    const vueNode = {
      type: "VAttribute",
      directive: true,
      key: { name: "bind", argument: { name: "class" } },
      value: { type: "VExpressionContainer", expression },
    }

    const callees = ["clsx"]
    handleVueAttributes(
      { children: [vueNode] },
      mockContext,
      false,
      callees,
      undefined,
    )

    expect(mockHandleCallExpression).toHaveBeenCalledWith(
      expression,
      mockContext,
      callees,
      undefined,
    )
  })

  it("should handle non-class attributes gracefully", () => {
    const mockContext = { report: vi.fn() } as any
    const vueNode = {
      type: "VAttribute",
      key: { name: "id" },
      value: { type: "VLiteral", value: "test-id" },
    }

    handleVueAttributes(
      { children: [vueNode] },
      mockContext,
      false,
      [],
      undefined,
    )

    expect(mockContext.report).not.toHaveBeenCalled()
  })

  it("should handle null nodes gracefully", () => {
    const mockContext = { report: vi.fn() } as any

    expect(() => {
      handleVueAttributes(null, mockContext, false, [], undefined)
    }).not.toThrow()
  })
})
