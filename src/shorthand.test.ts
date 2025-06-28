import { describe, expect, it } from "vitest"

import { applyShorthand, applyShorthands } from "./shorthand"

describe("shorthand", () => {
  describe("applyShorthand", () => {
    it("should apply spacing shorthand", () => {
      const result = applyShorthand("px-4 py-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("p-4")
      expect(result.value).toBe("p-4")
    })

    it("should handle 2-way spacing patterns", () => {
      const result = applyShorthand("mx-4 my-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("m-4")
      expect(result.value).toBe("m-4")
    })

    it("should handle 4-way spacing patterns", () => {
      const result = applyShorthand("mt-4 mb-4 ml-4 mr-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("m-4")
      expect(result.value).toBe("m-4")
    })

    it("should handle border patterns", () => {
      const result = applyShorthand("border-x-2 border-y-2")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("border-2")
      expect(result.value).toBe("border-2")
    })

    it("should handle rounded patterns", () => {
      const result = applyShorthand("rounded-tl-lg rounded-tr-lg")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("rounded-t-lg")
      expect(result.value).toBe("rounded-t-lg")
    })

    it("should handle sizing patterns", () => {
      const result = applyShorthand("w-4 h-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("size-4")
      expect(result.value).toBe("size-4")
    })

    it("should handle transform patterns", () => {
      const result = applyShorthand("translate-x-4 translate-y-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("translate-4")
      expect(result.value).toBe("translate-4")
    })

    it("should handle misc patterns", () => {
      const result = applyShorthand(
        "overflow-hidden text-ellipsis whitespace-nowrap",
      )
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("truncate")
      expect(result.value).toBe("truncate")
    })

    it("should handle prefixed classes", () => {
      const result = applyShorthand("md:mx-4 md:my-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("md:m-4")
      expect(result.value).toBe("md:m-4")
    })

    it("should handle negative values", () => {
      const result = applyShorthand("-mx-4 -my-4")
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe("-m-4")
      expect(result.value).toBe("-m-4")
    })

    it("should return original when no shorthand possible", () => {
      const result = applyShorthand("m-4 p-2")
      expect(result.applied).toBe(false)
      expect(result.value).toBe("m-4 p-2")
    })

    it.each([
      ["content-center justify-center", "place-content-center"],
      ["sm:items-start sm:justify-items-start", "sm:place-items-start"],
      ["md:self-end md:justify-self-end", "md:place-self-end"],
    ])("should transform %s to %s", (input, expected) => {
      const result = applyShorthand(input)
      expect(result.applied).toBe(true)
      expect(result.shorthand).toBe(expected)
    })
  })

  describe("applyShorthands", () => {
    it("should apply multiple shorthands", () => {
      const result = applyShorthands("mx-4 my-4 px-2 py-2")
      expect(result.applied).toBe(true)
      expect(result.value).toBe("m-4 p-2")
      expect(result.transformations).toHaveLength(2)
    })

    it("should handle complex combinations", () => {
      const result = applyShorthands("mt-4 mb-4 ml-4 mr-4 w-8 h-8")
      expect(result.applied).toBe(true)
      expect(result.value).toBe("m-4 size-8")
      expect(result.transformations).toHaveLength(2)
    })

    it("should compact transformations correctly", () => {
      const result = applyShorthands("mx-4 my-4 px-2 py-2 w-8 h-8")
      expect(result.applied).toBe(true)
      expect(result.transformations.length).toBeGreaterThan(0)

      // Check that transformations are properly compacted
      const transformationClasses = result.transformations.flatMap((t) =>
        t.classnames.split(", "),
      )
      expect(transformationClasses).toContain("mx-4")
      expect(transformationClasses).toContain("my-4")
    })

    it("should preserve class order", () => {
      const result = applyShorthands("bg-red-500 mx-4 my-4 text-lg")
      expect(result.applied).toBe(true)
      expect(result.value).toBe("bg-red-500 m-4 text-lg")
    })

    it("should handle empty input", () => {
      const result = applyShorthands("")
      expect(result.applied).toBe(false)
      expect(result.value).toBe("")
      expect(result.transformations).toHaveLength(0)
    })

    it("should handle single class", () => {
      const result = applyShorthands("m-4")
      expect(result.applied).toBe(false)
      expect(result.value).toBe("m-4")
    })

    it("should handle mixed prefixes correctly", () => {
      const result = applyShorthands("md:mx-4 md:my-4 lg:px-2 lg:py-2")
      expect(result.applied).toBe(true)
      expect(result.value).toBe("md:m-4 lg:p-2")
    })
  })

  describe("performance comparison", () => {
    it("should handle large class lists efficiently", () => {
      // Create a class list with pairs that can be shortened
      const largeClassList = Array.from(
        { length: 50 },
        (_, i) => `mx-${i} my-${i}`,
      ).join(" ")

      const start = performance.now()
      const result = applyShorthands(largeClassList)
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // Should complete in under 100ms
      expect(result.applied).toBe(true) // Should find many shorthands
    })
  })
})
