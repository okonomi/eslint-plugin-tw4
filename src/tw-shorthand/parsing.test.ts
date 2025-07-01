import { describe, expect, it } from "vitest"
import { type ClassInfo, parseClass, parseClasses } from "./parsing"

describe("parseClasses", () => {
  it.each<[string, ClassInfo]>([
    [
      "bg-red-500",
      {
        original: "bg-red-500",
        prefix: "",
        type: "bg",
        value: "red-500",
        isNegative: false,
        important: null,
        baseClass: "bg-red-500",
      },
    ],
    [
      "md:text-lg",
      {
        original: "md:text-lg",
        prefix: "md:",
        type: "text",
        value: "lg",
        isNegative: false,
        important: null,
        baseClass: "text-lg",
      },
    ],
    [
      "border-2",
      {
        original: "border-2",
        prefix: "",
        type: "border",
        value: "2",
        isNegative: false,
        important: null,
        category: "border-width-color",
        baseClass: "border-2",
      },
    ],
    [
      "-m-4",
      {
        original: "-m-4",
        prefix: "",
        type: "m",
        value: "4",
        isNegative: true,
        important: null,
        baseClass: "-m-4",
      },
    ],
    [
      "rounded-full",
      {
        original: "rounded-full",
        prefix: "",
        type: "rounded",
        value: "full",
        isNegative: false,
        important: null,
        category: "border-radius",
        baseClass: "rounded-full",
      },
    ],
    [
      "inset-0",
      {
        original: "inset-0",
        prefix: "",
        type: "inset",
        value: "0",
        isNegative: false,
        important: null,
        category: "layout-inset",
        baseClass: "inset-0",
      },
    ],
    [
      "top-4",
      {
        original: "top-4",
        prefix: "",
        type: "top",
        value: "4",
        isNegative: false,
        important: null,
        category: "layout-inset",
        baseClass: "top-4",
      },
    ],
    [
      "scroll-m-8",
      {
        original: "scroll-m-8",
        prefix: "",
        type: "scroll-m",
        value: "8",
        isNegative: false,
        important: null,
        category: "layout-scroll",
        baseClass: "scroll-m-8",
      },
    ],
    [
      "gap-x-2",
      {
        original: "gap-x-2",
        prefix: "",
        type: "gap-x",
        value: "2",
        isNegative: false,
        important: null,
        category: "layout-gap",
        baseClass: "gap-x-2",
      },
    ],
    [
      "grid-cols-3",
      {
        original: "grid-cols-3",
        prefix: "",
        type: "grid",
        value: "cols-3",
        isNegative: false,
        important: null,
        baseClass: "grid-cols-3",
      },
    ],
    [
      "transform-gpu",
      {
        original: "transform-gpu",
        prefix: "",
        type: "transform",
        value: "gpu",
        isNegative: false,
        important: null,
        baseClass: "transform-gpu",
      },
    ],
    [
      "overflow-hidden",
      {
        original: "overflow-hidden",
        prefix: "",
        type: "overflow",
        value: "hidden",
        isNegative: false,
        important: null,
        category: "misc",
        baseClass: "overflow-hidden",
      },
    ],
    [
      "overscroll-auto",
      {
        original: "overscroll-auto",
        prefix: "",
        type: "overscroll",
        value: "auto",
        isNegative: false,
        important: null,
        category: "misc",
        baseClass: "overscroll-auto",
      },
    ],
    [
      "hover:focus:lg:p-4",
      {
        original: "hover:focus:lg:p-4",
        prefix: "hover:focus:lg:",
        type: "p",
        value: "4",
        isNegative: false,
        important: null,
        baseClass: "p-4",
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
      prefix: "",
      type: "m",
      value: "4",
      isNegative: false,
      important: null,
      baseClass: "m-4",
    })
    expect(result[1]).toEqual({
      original: "p-2",
      prefix: "",
      type: "p",
      value: "2",
      isNegative: false,
      important: null,
      baseClass: "p-2",
    })
    expect(result[2]).toEqual({
      original: "bg-red-500",
      prefix: "",
      type: "bg",
      value: "red-500",
      isNegative: false,
      important: null,
      baseClass: "bg-red-500",
    })
  })

  it("should handle unparseable classes gracefully", () => {
    const result = parseClass("unknown-class")
    expect(result).toEqual({
      original: "unknown-class",
      prefix: "",
      type: "unknown",
      value: "class",
      isNegative: false,
      important: null,
      baseClass: "unknown-class",
    })
  })

  it("should handle classes without dashes", () => {
    const result = parseClass("block")
    expect(result).toEqual({
      original: "block",
      prefix: "",
      type: "block",
      value: "",
      isNegative: false,
      important: null,
      baseClass: "block",
    })
  })

  it("should handle complex prefixes", () => {
    const result = parseClass("dark:hover:md:lg:xl:m-4")
    expect(result).toEqual({
      original: "dark:hover:md:lg:xl:m-4",
      prefix: "dark:hover:md:lg:xl:",
      type: "m",
      value: "4",
      isNegative: false,
      important: null,
      baseClass: "m-4",
    })
  })

  it("should handle negative values with prefixes", () => {
    const result = parseClass("lg:-m-8")
    expect(result).toEqual({
      original: "lg:-m-8",
      prefix: "lg:",
      type: "m",
      value: "8",
      isNegative: true,
      important: null,
      baseClass: "-m-8",
    })
  })

  // Test cases for important modifier
  describe("important modifier", () => {
    it.each<[string, ClassInfo]>([
      [
        "bg-red-500!",
        {
          original: "bg-red-500!",
          prefix: "",
          type: "bg",
          value: "red-500",
          isNegative: false,
          important: "trailing",
          baseClass: "bg-red-500",
        },
      ],
      [
        "hover:bg-red-500!",
        {
          original: "hover:bg-red-500!",
          prefix: "hover:",
          type: "bg",
          value: "red-500",
          isNegative: false,
          important: "trailing",
          baseClass: "bg-red-500",
        },
      ],
      [
        "md:lg:text-xl!",
        {
          original: "md:lg:text-xl!",
          prefix: "md:lg:",
          type: "text",
          value: "xl",
          isNegative: false,
          important: "trailing",
          baseClass: "text-xl",
        },
      ],
      [
        "-m-4!",
        {
          original: "-m-4!",
          prefix: "",
          type: "m",
          value: "4",
          isNegative: true,
          important: "trailing",
          baseClass: "-m-4",
        },
      ],
      [
        "hover:-translate-x-2!",
        {
          original: "hover:-translate-x-2!",
          prefix: "hover:",
          type: "translate-x",
          value: "2",
          isNegative: true,
          important: "trailing",
          category: "transform",
          baseClass: "-translate-x-2",
        },
      ],
      [
        "border-x-4!",
        {
          original: "border-x-4!",
          prefix: "",
          type: "border-x",
          value: "4",
          isNegative: false,
          important: "trailing",
          category: "border-width-color",
          baseClass: "border-x-4",
        },
      ],
      [
        "rounded-lg!",
        {
          original: "rounded-lg!",
          prefix: "",
          type: "rounded",
          value: "lg",
          isNegative: false,
          important: "trailing",
          category: "border-radius",
          baseClass: "rounded-lg",
        },
      ],
      [
        "justify-center!",
        {
          original: "justify-center!",
          prefix: "",
          type: "justify-content",
          value: "center",
          isNegative: false,
          important: "trailing",
          category: "grid-flexbox",
          baseClass: "justify-center",
        },
      ],
    ])("should parse %s correctly", (original, expected) => {
      const result = parseClass(original)
      expect(result).toEqual(expected)
    })

    it("should handle edge cases for important modifier", () => {
      // Double exclamation - only last one is considered important
      const result1 = parseClass("bg-red-500!!")
      expect(result1.important).toBe("trailing")
      expect(result1.value).toBe("red-500!")

      // Exclamation at start - treated as part of class name
      const result2 = parseClass("!bg-red-500")
      expect(result2.important).toBe("leading")
      expect(result2.type).toBe("bg")

      // Empty string with exclamation
      const result3 = parseClass("!")
      expect(result3.important).toBe("trailing")
      expect(result3.type).toBe("")

      // Prefix with just exclamation
      const result4 = parseClass("hover:!")
      expect(result4.important).toBe("trailing")
      expect(result4.prefix).toBe("hover:")
      expect(result4.type).toBe("")
    })

    // Test cases for leading important modifier
    it("should parse leading important modifier", () => {
      const result = parseClass("!bg-red-500")
      expect(result).toEqual({
        original: "!bg-red-500",
        prefix: "",
        type: "bg",
        value: "red-500",
        isNegative: false,
        important: "leading",
        baseClass: "bg-red-500",
      })
    })

    it("should parse leading important modifier with prefix", () => {
      const result = parseClass("hover:sm:!overflow-hidden")
      expect(result).toEqual({
        original: "hover:sm:!overflow-hidden",
        prefix: "hover:sm:",
        type: "overflow",
        value: "hidden",
        isNegative: false,
        important: "leading",
        category: "misc",
        baseClass: "overflow-hidden",
      })
    })

    it("should handle both leading and trailing important as invalid", () => {
      const result = parseClass("!bg-red-500!")
      expect(result).toEqual({
        original: "!bg-red-500!",
        prefix: "",
        type: "!bg-red-500!",
        value: "",
        isNegative: false,
        important: null,
        baseClass: "!bg-red-500!",
      })
    })

    it("should handle both leading and trailing important with prefix as invalid", () => {
      const result = parseClass("hover:!bg-red-500!")
      expect(result).toEqual({
        original: "hover:!bg-red-500!",
        prefix: "",
        type: "hover:!bg-red-500!",
        value: "",
        isNegative: false,
        important: null,
        baseClass: "hover:!bg-red-500!",
      })
    })
  })
})
