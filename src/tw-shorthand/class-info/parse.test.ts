import { describe, expect, it } from "vitest"
import { parseClass, parseClasses } from "./parse"
import type { ClassInfo } from "./type"

describe("parseClasses", () => {
  it.each<[string, ClassInfo]>([
    [
      "bg-red-500",
      {
        original: "bg-red-500",
        baseClass: "bg-red-500",
        detail: {
          prefix: "",
          type: "bg",
          value: "red-500",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "md:text-lg",
      {
        original: "md:text-lg",
        baseClass: "text-lg",
        detail: {
          prefix: "md:",
          type: "text",
          value: "lg",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "border-2",
      {
        original: "border-2",
        category: "border-width-color",
        baseClass: "border-2",
        detail: {
          prefix: "",
          type: "border",
          value: "2",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "-m-4",
      {
        original: "-m-4",
        baseClass: "-m-4",
        detail: {
          prefix: "",
          type: "m",
          value: "4",
          isNegative: true,
          important: null,
        },
      },
    ],
    [
      "rounded-full",
      {
        original: "rounded-full",
        category: "border-radius",
        baseClass: "rounded-full",
        detail: {
          prefix: "",
          type: "rounded",
          value: "full",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "inset-0",
      {
        original: "inset-0",
        category: "layout-inset",
        baseClass: "inset-0",
        detail: {
          prefix: "",
          type: "inset",
          value: "0",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "top-4",
      {
        original: "top-4",
        category: "layout-inset",
        baseClass: "top-4",
        detail: {
          prefix: "",
          type: "top",
          value: "4",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "scroll-m-8",
      {
        original: "scroll-m-8",
        category: "layout-scroll",
        baseClass: "scroll-m-8",
        detail: {
          prefix: "",
          type: "scroll-m",
          value: "8",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "gap-x-2",
      {
        original: "gap-x-2",
        category: "layout-gap",
        baseClass: "gap-x-2",
        detail: {
          prefix: "",
          type: "gap-x",
          value: "2",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "grid-cols-3",
      {
        original: "grid-cols-3",
        baseClass: "grid-cols-3",
        detail: {
          prefix: "",
          type: "grid",
          value: "cols-3",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "transform-gpu",
      {
        original: "transform-gpu",
        baseClass: "transform-gpu",
        detail: {
          prefix: "",
          type: "transform",
          value: "gpu",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "overflow-hidden",
      {
        original: "overflow-hidden",
        category: "misc",
        baseClass: "overflow-hidden",
        detail: {
          prefix: "",
          type: "overflow",
          value: "hidden",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "overscroll-auto",
      {
        original: "overscroll-auto",
        category: "misc",
        baseClass: "overscroll-auto",
        detail: {
          prefix: "",
          type: "overscroll",
          value: "auto",
          isNegative: false,
          important: null,
        },
      },
    ],
    [
      "hover:focus:lg:p-4",
      {
        original: "hover:focus:lg:p-4",
        baseClass: "p-4",
        detail: {
          prefix: "hover:focus:lg:",
          type: "p",
          value: "4",
          isNegative: false,
          important: null,
        },
      },
    ],
  ])("should parse %s correctly", (original, expected) => {
    const result = parseClass(original)
    expect(result).toEqual(expected)
  })

  it("should parse multiple classes", () => {
    const classes = ["m-4", "p-2", "bg-red-500"]
    const result = parseClasses(classes)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      original: "m-4",
      baseClass: "m-4",
      detail: {
        prefix: "",
        type: "m",
        value: "4",
        isNegative: false,
        important: null,
      },
    })
    expect(result[1]).toEqual({
      original: "p-2",
      baseClass: "p-2",
      detail: {
        prefix: "",
        type: "p",
        value: "2",
        isNegative: false,
        important: null,
      },
    })
    expect(result[2]).toEqual({
      original: "bg-red-500",
      baseClass: "bg-red-500",
      detail: {
        prefix: "",
        type: "bg",
        value: "red-500",
        isNegative: false,
        important: null,
      },
    })
  })

  it("should handle unparseable classes gracefully", () => {
    const result = parseClass("unknown-class")
    expect(result).toEqual({
      original: "unknown-class",
      baseClass: "unknown-class",
      detail: {
        prefix: "",
        type: "unknown",
        value: "class",
        isNegative: false,
        important: null,
      },
    })
  })

  it("should handle classes without dashes", () => {
    const result = parseClass("block")
    expect(result).toEqual({
      original: "block",
      baseClass: "block",
      detail: {
        prefix: "",
        type: "block",
        value: "",
        isNegative: false,
        important: null,
      },
    })
  })

  it("should handle complex prefixes", () => {
    const result = parseClass("dark:hover:md:lg:xl:m-4")
    expect(result).toEqual({
      original: "dark:hover:md:lg:xl:m-4",
      baseClass: "m-4",
      detail: {
        prefix: "dark:hover:md:lg:xl:",
        type: "m",
        value: "4",
        isNegative: false,
        important: null,
      },
    })
  })

  it("should handle negative values with prefixes", () => {
    const result = parseClass("lg:-m-8")
    expect(result).toEqual({
      original: "lg:-m-8",
      baseClass: "-m-8",
      detail: {
        prefix: "lg:",
        type: "m",
        value: "8",
        isNegative: true,
        important: null,
      },
    })
  })

  // Test cases for important modifier
  describe("important modifier", () => {
    it.each<[string, ClassInfo]>([
      [
        "bg-red-500!",
        {
          original: "bg-red-500!",
          baseClass: "bg-red-500",
          detail: {
            prefix: "",
            type: "bg",
            value: "red-500",
            isNegative: false,
            important: "trailing",
          },
        },
      ],
      [
        "hover:bg-red-500!",
        {
          original: "hover:bg-red-500!",
          baseClass: "bg-red-500",
          detail: {
            prefix: "hover:",
            type: "bg",
            value: "red-500",
            isNegative: false,
            important: "trailing",
          },
        },
      ],
      [
        "md:lg:text-xl!",
        {
          original: "md:lg:text-xl!",
          baseClass: "text-xl",
          detail: {
            prefix: "md:lg:",
            type: "text",
            value: "xl",
            isNegative: false,
            important: "trailing",
          },
        },
      ],
      [
        "-m-4!",
        {
          original: "-m-4!",
          baseClass: "-m-4",
          detail: {
            prefix: "",
            type: "m",
            value: "4",
            isNegative: true,
            important: "trailing",
          },
        },
      ],
      [
        "hover:-translate-x-2!",
        {
          original: "hover:-translate-x-2!",
          category: "transform",
          baseClass: "-translate-x-2",
          detail: {
            prefix: "hover:",
            type: "translate-x",
            value: "2",
            isNegative: true,
            important: "trailing",
          },
        },
      ],
      [
        "border-x-4!",
        {
          original: "border-x-4!",
          category: "border-width-color",
          baseClass: "border-x-4",
          detail: {
            prefix: "",
            type: "border-x",
            value: "4",
            isNegative: false,
            important: "trailing",
          },
        },
      ],
      [
        "rounded-lg!",
        {
          original: "rounded-lg!",
          category: "border-radius",
          baseClass: "rounded-lg",
          detail: {
            prefix: "",
            type: "rounded",
            value: "lg",
            isNegative: false,
            important: "trailing",
          },
        },
      ],
      [
        "justify-center!",
        {
          original: "justify-center!",
          category: "grid-flexbox",
          baseClass: "justify-center",
          detail: {
            prefix: "",
            type: "justify-content",
            value: "center",
            isNegative: false,
            important: "trailing",
          },
        },
      ],
    ])("should parse %s correctly", (original, expected) => {
      const result = parseClass(original)
      expect(result).toEqual(expected)
    })

    it("should handle edge cases for important modifier", () => {
      // Double exclamation - only last one is considered important
      const result1 = parseClass("bg-red-500!!")
      expect(result1.detail.important).toBe("trailing")
      expect(result1.detail.value).toBe("red-500!")

      // Exclamation at start - treated as part of class name
      const result2 = parseClass("!bg-red-500")
      expect(result2.detail.important).toBe("leading")
      expect(result2.detail.type).toBe("bg")

      // Empty string with exclamation
      const result3 = parseClass("!")
      expect(result3.detail.important).toBe("trailing")
      expect(result3.detail.type).toBe("")

      // Prefix with just exclamation
      const result4 = parseClass("hover:!")
      expect(result4.detail.important).toBe("trailing")
      expect(result4.detail.prefix).toBe("hover:")
      expect(result4.detail.type).toBe("")
    })

    // Test cases for leading important modifier
    it("should parse leading important modifier", () => {
      const result = parseClass("!bg-red-500")
      expect(result).toEqual({
        original: "!bg-red-500",
        baseClass: "bg-red-500",
        detail: {
          prefix: "",
          type: "bg",
          value: "red-500",
          isNegative: false,
          important: "leading",
        },
      })
    })

    it("should parse leading important modifier with prefix", () => {
      const result = parseClass("hover:sm:!overflow-hidden")
      expect(result).toEqual({
        original: "hover:sm:!overflow-hidden",
        category: "misc",
        baseClass: "overflow-hidden",
        detail: {
          prefix: "hover:sm:",
          type: "overflow",
          value: "hidden",
          isNegative: false,
          important: "leading",
        },
      })
    })

    it("should handle both leading and trailing important as invalid", () => {
      const result = parseClass("!bg-red-500!")
      expect(result).toEqual({
        original: "!bg-red-500!",
        baseClass: "!bg-red-500!",
        detail: {
          prefix: "",
          type: "!bg-red-500!",
          value: "",
          isNegative: false,
          important: null,
        },
      })
    })

    it("should handle both leading and trailing important with prefix as invalid", () => {
      const result = parseClass("hover:!bg-red-500!")
      expect(result).toEqual({
        original: "hover:!bg-red-500!",
        baseClass: "hover:!bg-red-500!",
        detail: {
          prefix: "",
          type: "hover:!bg-red-500!",
          value: "",
          isNegative: false,
          important: null,
        },
      })
    })
  })
})
