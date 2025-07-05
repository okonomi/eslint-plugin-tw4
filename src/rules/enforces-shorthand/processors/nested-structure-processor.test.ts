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

vi.mock("../utils/quote-utils", () => ({
  wrapWithQuotesFromContext: vi.fn((value: string) => `"${value}"`),
}))

const { processClassNames } = await import("./class-processor")
const { reportErrors } = await import("../utils/error-reporter")
const { wrapWithQuotesFromContext } = await import("../utils/quote-utils")

describe("nested-structure-processor", () => {
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

  describe("processNestedStructure", () => {
    describe("ArrayExpression processing", () => {
      it("should process string literals in array elements", () => {
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

        const arrayNode = {
          type: "ArrayExpression",
          elements: [
            {
              type: "Literal",
              value: "mt-4 mr-4 mb-4 ml-4",
            },
            {
              type: "Literal",
              value: "flex items-center",
            },
          ],
        } as unknown as TSESTree.ArrayExpression

        processNestedStructure(arrayNode, mockContext)

        expect(processClassNames).toHaveBeenCalledTimes(2)
        expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4")
        expect(processClassNames).toHaveBeenCalledWith("flex items-center")
        expect(reportErrors).toHaveBeenCalledTimes(2)
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
        expect(reportErrors).not.toHaveBeenCalled()
      })

      it("should ignore null elements in array", () => {
        const arrayNode = {
          type: "ArrayExpression",
          elements: [
            null,
            {
              type: "Literal",
              value: "flex",
            },
          ],
        } as unknown as TSESTree.ArrayExpression

        processNestedStructure(arrayNode, mockContext)

        expect(processClassNames).toHaveBeenCalledTimes(1)
        expect(processClassNames).toHaveBeenCalledWith("flex")
      })

      it("should recursively process nested structures in array", () => {
        const arrayNode = {
          type: "ArrayExpression",
          elements: [
            {
              type: "ArrayExpression",
              elements: [
                {
                  type: "Literal",
                  value: "nested-class",
                },
              ],
            },
          ],
        } as unknown as TSESTree.ArrayExpression

        processNestedStructure(arrayNode, mockContext)

        expect(processClassNames).toHaveBeenCalledWith("nested-class")
      })
    })

    describe("ObjectExpression processing", () => {
      it("should process string literal keys in object properties", () => {
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

        const objectNode = {
          type: "ObjectExpression",
          properties: [
            {
              type: "Property",
              key: {
                type: "Literal",
                value: "mt-4 mr-4 mb-4 ml-4",
              },
              value: {
                type: "Literal",
                value: true,
              },
            },
          ],
        } as unknown as TSESTree.ObjectExpression

        processNestedStructure(objectNode, mockContext)

        expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4")
        expect(reportErrors).toHaveBeenCalledWith(mockContext, {
          targetNode: (objectNode.properties[0] as TSESTree.Property).key,
          fixText: '"mt-4 mr-4 mb-4 ml-4"',
          originalValue: "mt-4 mr-4 mb-4 ml-4",
          result: mockResult,
        })
      })

      it("should process identifier keys in object properties", () => {
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

        const objectNode = {
          type: "ObjectExpression",
          properties: [
            {
              type: "Property",
              computed: false,
              key: {
                type: "Identifier",
                name: "mt-4mr-4mb-4ml-4", // Valid identifier format
              },
              value: {
                type: "Literal",
                value: true,
              },
            },
          ],
        } as unknown as TSESTree.ObjectExpression

        processNestedStructure(objectNode, mockContext)

        expect(processClassNames).toHaveBeenCalledWith("mt-4mr-4mb-4ml-4")
        expect(reportErrors).toHaveBeenCalledWith(mockContext, {
          targetNode: (objectNode.properties[0] as TSESTree.Property).key,
          fixText: '"mt-4mr-4mb-4ml-4"',
          originalValue: "mt-4mr-4mb-4ml-4",
          result: mockResult,
        })
      })

      it("should ignore computed identifier keys", () => {
        const objectNode = {
          type: "ObjectExpression",
          properties: [
            {
              type: "Property",
              computed: true, // computed property
              key: {
                type: "Identifier",
                name: "dynamicKey",
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

      it("should ignore non-string literal and non-identifier keys", () => {
        const objectNode = {
          type: "ObjectExpression",
          properties: [
            {
              type: "Property",
              key: {
                type: "Literal",
                value: 123, // number key
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

      it("should recursively process property values", () => {
        const objectNode = {
          type: "ObjectExpression",
          properties: [
            {
              type: "Property",
              key: {
                type: "Literal",
                value: "variants",
              },
              value: {
                type: "ObjectExpression",
                properties: [
                  {
                    type: "Property",
                    key: {
                      type: "Literal",
                      value: "size",
                    },
                    value: {
                      type: "ArrayExpression",
                      elements: [
                        {
                          type: "Literal",
                          value: "mt-4 mr-4 mb-4 ml-4",
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        } as unknown as TSESTree.ObjectExpression

        processNestedStructure(objectNode, mockContext)

        // Should process the class in the nested array
        expect(processClassNames).toHaveBeenCalledWith("mt-4 mr-4 mb-4 ml-4")
      })

      it("should handle non-Property objects in properties array", () => {
        const objectNode = {
          type: "ObjectExpression",
          properties: [
            {
              type: "SpreadElement", // Not a Property
              argument: {
                type: "Identifier",
                name: "someObject",
              },
            },
          ],
        } as unknown as TSESTree.ObjectExpression

        processNestedStructure(objectNode, mockContext)

        expect(processClassNames).not.toHaveBeenCalled()
        expect(reportErrors).not.toHaveBeenCalled()
      })
    })

    describe("Edge cases", () => {
      it("should handle empty array", () => {
        const arrayNode = {
          type: "ArrayExpression",
          elements: [],
        } as unknown as TSESTree.ArrayExpression

        processNestedStructure(arrayNode, mockContext)

        expect(processClassNames).not.toHaveBeenCalled()
        expect(reportErrors).not.toHaveBeenCalled()
      })

      it("should handle empty object", () => {
        const objectNode = {
          type: "ObjectExpression",
          properties: [],
        } as unknown as TSESTree.ObjectExpression

        processNestedStructure(objectNode, mockContext)

        expect(processClassNames).not.toHaveBeenCalled()
        expect(reportErrors).not.toHaveBeenCalled()
      })

      it("should handle unsupported node types", () => {
        const unsupportedNode = {
          type: "CallExpression",
        } as unknown as TSESTree.Node

        // Should not throw error
        expect(() => {
          processNestedStructure(unsupportedNode, mockContext)
        }).not.toThrow()

        expect(processClassNames).not.toHaveBeenCalled()
        expect(reportErrors).not.toHaveBeenCalled()
      })
    })

    describe("Integration scenarios", () => {
      it("should handle CVA-like pattern with nested variants", () => {
        const cvaPattern = {
          type: "ObjectExpression",
          properties: [
            {
              type: "Property",
              key: { type: "Literal", value: "variants" },
              value: {
                type: "ObjectExpression",
                properties: [
                  {
                    type: "Property",
                    key: { type: "Literal", value: "size" },
                    value: {
                      type: "ObjectExpression",
                      properties: [
                        {
                          type: "Property",
                          key: { type: "Literal", value: "sm" },
                          value: {
                            type: "Literal",
                            value: "mt-2 mr-2 mb-2 ml-2",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        } as unknown as TSESTree.ObjectExpression

        processNestedStructure(cvaPattern, mockContext)

        // Should process all keys and the final value
        expect(processClassNames).toHaveBeenCalledTimes(3)
        expect(processClassNames).toHaveBeenCalledWith("variants")
        expect(processClassNames).toHaveBeenCalledWith("size")
        expect(processClassNames).toHaveBeenCalledWith("sm")
      })

      it("should use wrapWithQuotesFromContext for fix text", () => {
        const mockResult = { applied: true, value: "m-4", transformations: [] }
        vi.mocked(processClassNames).mockReturnValue(mockResult)
        vi.mocked(wrapWithQuotesFromContext).mockReturnValue('"test-class"')

        const arrayNode = {
          type: "ArrayExpression",
          elements: [
            {
              type: "Literal",
              value: "test-class",
            },
          ],
        } as unknown as TSESTree.ArrayExpression

        processNestedStructure(arrayNode, mockContext)

        expect(wrapWithQuotesFromContext).toHaveBeenCalledWith(
          "test-class",
          mockContext,
        )
        expect(reportErrors).toHaveBeenCalledWith(mockContext, {
          targetNode: arrayNode.elements[0],
          fixText: '"test-class"',
          originalValue: "test-class",
          result: mockResult,
        })
      })
    })
  })
})
