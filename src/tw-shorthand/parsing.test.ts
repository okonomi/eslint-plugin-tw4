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
        isImportant: false,
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
        isImportant: false,
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
        isImportant: false,
        category: "border-width-color",
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
        isImportant: false,
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
        isImportant: false,
        category: "border-radius",
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
        isImportant: false,
        category: "layout-inset",
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
        isImportant: false,
        category: "layout-inset",
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
        isImportant: false,
        category: "layout-scroll",
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
        isImportant: false,
        category: "layout-gap",
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
        isImportant: false,
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
        isImportant: false,
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
        isImportant: false,
        category: "misc",
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
        isImportant: false,
        category: "misc",
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
        isImportant: false,
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
      isImportant: false,
    })
    expect(result[1]).toEqual({
      original: "p-2",
      prefix: "",
      type: "p",
      value: "2",
      isNegative: false,
      isImportant: false,
    })
    expect(result[2]).toEqual({
      original: "bg-red-500",
      prefix: "",
      type: "bg",
      value: "red-500",
      isNegative: false,
      isImportant: false,
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
      isImportant: false,
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
      isImportant: false,
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
      isImportant: false,
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
      isImportant: false,
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
          isImportant: true,
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
          isImportant: true,
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
          isImportant: true,
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
          isImportant: true,
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
          isImportant: true,
          category: "transform",
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
          isImportant: true,
          category: "border-width-color",
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
          isImportant: true,
          category: "border-radius",
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
          isImportant: true,
          category: "grid-flexbox",
        },
      ],
    ])("should parse %s correctly", (original, expected) => {
      const result = parseClass(original)
      expect(result).toEqual(expected)
    })

    it("should handle edge cases for important modifier", () => {
      // Double exclamation - only last one is considered important
      const result1 = parseClass("bg-red-500!!")
      expect(result1.isImportant).toBe(true)
      expect(result1.value).toBe("red-500!")

      // Exclamation at start - treated as part of class name
      const result2 = parseClass("!bg-red-500")
      expect(result2.isImportant).toBe(false)
      expect(result2.type).toBe("!bg")

      // Empty string with exclamation
      const result3 = parseClass("!")
      expect(result3.isImportant).toBe(true)
      expect(result3.type).toBe("")

      // Prefix with just exclamation
      const result4 = parseClass("hover:!")
      expect(result4.isImportant).toBe(true)
      expect(result4.prefix).toBe("hover:")
      expect(result4.type).toBe("")
    })
  })
})
