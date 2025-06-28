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
    })
    expect(result[1]).toEqual({
      original: "p-2",
      prefix: "",
      type: "p",
      value: "2",
      isNegative: false,
    })
    expect(result[2]).toEqual({
      original: "bg-red-500",
      prefix: "",
      type: "bg",
      value: "red-500",
      isNegative: false,
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
    })
  })
})
