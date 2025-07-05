import type { RuleContext } from "@typescript-eslint/utils/ts-eslint"
import { describe, expect, it } from "vitest"
import type { QuoteStyle } from "../types"
import {
  getQuoteStyle,
  wrapWithQuotes,
  wrapWithQuotesFromContext,
} from "./quote-utils"

// Mock RuleContext for testing
function createMockContext(
  options: {
    quotes?: string[]
    sourceCode?: {
      parserServices?: {
        program?: unknown
      }
    } | null
    settings?: {
      quotes?: string[]
    }
  } = {},
): RuleContext<string, readonly unknown[]> {
  return {
    sourceCode: options.sourceCode,
    getSourceCode: () => options.sourceCode,
    settings: options.settings,
  } as unknown as RuleContext<string, readonly unknown[]>
}

describe("quote-utils", () => {
  describe("getQuoteStyle", () => {
    it("should return 'single' as default when no configuration is found", () => {
      const context = createMockContext()
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'single' when no sourceCode is available", () => {
      const context = createMockContext({ sourceCode: null })
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'single' when no parserServices is available", () => {
      const context = createMockContext({
        sourceCode: {},
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'single' when no quotes setting is found", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {},
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'single' when quotes setting is not an array", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: [], // Changed from string to array
        },
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'single' when quotes setting is empty array", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: [],
        },
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'single' when quotes setting first element is 'single'", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: ["single"],
        },
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })

    it("should return 'double' when quotes setting first element is 'double'", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: ["double"],
        },
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("double")
    })

    it("should return 'double' when quotes setting first element is not 'single'", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: ["backtick"],
        },
      })
      const result = getQuoteStyle(context)
      expect(result).toBe("double")
    })

    it("should use getSourceCode() fallback when sourceCode is not available", () => {
      const mockSourceCode = {
        parserServices: {
          program: {},
        },
      }
      const context = {
        sourceCode: null,
        getSourceCode: () => mockSourceCode,
        settings: {
          quotes: ["single"],
        },
      } as unknown as RuleContext<string, readonly unknown[]>

      const result = getQuoteStyle(context)
      expect(result).toBe("single")
    })
  })

  describe("wrapWithQuotes", () => {
    it("should wrap text with single quotes when quoteStyle is 'single'", () => {
      const result = wrapWithQuotes("test", "single")
      expect(result).toBe("'test'")
    })

    it("should wrap text with double quotes when quoteStyle is 'double'", () => {
      const result = wrapWithQuotes("test", "double")
      expect(result).toBe('"test"')
    })

    it("should handle empty string", () => {
      expect(wrapWithQuotes("", "single")).toBe("''")
      expect(wrapWithQuotes("", "double")).toBe('""')
    })

    it("should handle text with spaces", () => {
      expect(wrapWithQuotes("hello world", "single")).toBe("'hello world'")
      expect(wrapWithQuotes("hello world", "double")).toBe('"hello world"')
    })

    it("should handle text with special characters", () => {
      expect(wrapWithQuotes("px-4 py-4", "single")).toBe("'px-4 py-4'")
      expect(wrapWithQuotes("px-4 py-4", "double")).toBe('"px-4 py-4"')
    })
  })

  describe("wrapWithQuotesFromContext", () => {
    it("should use single quotes when context returns 'single' style", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: ["single"],
        },
      })

      const result = wrapWithQuotesFromContext("test", context)
      expect(result).toBe("'test'")
    })

    it("should use double quotes when context returns 'double' style", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: ["double"],
        },
      })

      const result = wrapWithQuotesFromContext("test", context)
      expect(result).toBe('"test"')
    })

    it("should default to single quotes when no configuration is found", () => {
      const context = createMockContext()
      const result = wrapWithQuotesFromContext("test", context)
      expect(result).toBe("'test'")
    })

    it("should handle complex class names", () => {
      const context = createMockContext({
        sourceCode: {
          parserServices: {
            program: {},
          },
        },
        settings: {
          quotes: ["single"],
        },
      })

      const result = wrapWithQuotesFromContext("w-4 h-4 bg-blue-500", context)
      expect(result).toBe("'w-4 h-4 bg-blue-500'")
    })
  })

  describe("type safety", () => {
    it("should work with QuoteStyle type", () => {
      const singleStyle: QuoteStyle = "single"
      const doubleStyle: QuoteStyle = "double"

      expect(wrapWithQuotes("test", singleStyle)).toBe("'test'")
      expect(wrapWithQuotes("test", doubleStyle)).toBe('"test"')
    })
  })
})
