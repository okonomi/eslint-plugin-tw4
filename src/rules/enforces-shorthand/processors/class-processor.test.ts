import { describe, expect, it } from "vitest"
import { processClassNames } from "./class-processor"

describe("class-processor", () => {
  describe("processClassNames", () => {
    it("should return unchanged result for classes without shorthand potential", () => {
      const result = processClassNames("flex items-center justify-center")

      expect(result.applied).toBe(false)
      expect(result.value).toBe("flex items-center justify-center")
      expect(result.transformations).toEqual([])
    })

    it("should apply shorthand transformations for margin classes", () => {
      const result = processClassNames("mt-4 mr-4 mb-4 ml-4")

      expect(result.applied).toBe(true)
      expect(result.value).toBe("m-4")
      expect(result.transformations).toHaveLength(1)
      expect(result.transformations[0]).toEqual({
        shorthand: "m-4",
        classnames: "mt-4, mr-4, mb-4, ml-4",
      })
    })

    it("should apply shorthand transformations for padding classes", () => {
      const result = processClassNames("pt-2 pr-2 pb-2 pl-2")

      expect(result.applied).toBe(true)
      expect(result.value).toBe("p-2")
      expect(result.transformations).toHaveLength(1)
      expect(result.transformations[0]).toEqual({
        shorthand: "p-2",
        classnames: "pt-2, pr-2, pb-2, pl-2",
      })
    })

    it("should apply shorthand transformations for border width classes", () => {
      const result = processClassNames(
        "border-t-2 border-r-2 border-b-2 border-l-2",
      )

      expect(result.applied).toBe(true)
      expect(result.value).toBe("border-2")
      expect(result.transformations).toHaveLength(1)
      expect(result.transformations[0]).toEqual({
        shorthand: "border-2",
        classnames: "border-t-2, border-r-2, border-b-2, border-l-2",
      })
    })

    it("should apply shorthand transformations for border radius classes", () => {
      const result = processClassNames(
        "rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-lg",
      )

      expect(result.applied).toBe(true)
      expect(result.value).toBe("rounded-lg")
      expect(result.transformations).toHaveLength(1)
      expect(result.transformations[0]).toEqual({
        shorthand: "rounded-lg",
        classnames:
          "rounded-tl-lg, rounded-tr-lg, rounded-bl-lg, rounded-br-lg",
      })
    })

    it("should handle horizontal/vertical shorthand for margin", () => {
      const result = processClassNames("mx-4 my-2")

      expect(result.applied).toBe(false)
      expect(result.value).toBe("mx-4 my-2")
    })

    it("should handle mixed classes with and without shorthand potential", () => {
      const result = processClassNames("flex mt-4 mr-4 mb-4 ml-4 bg-blue-500")

      expect(result.applied).toBe(true)
      expect(result.value).toBe("flex m-4 bg-blue-500")
    })

    it("should handle empty string", () => {
      const result = processClassNames("")

      expect(result.applied).toBe(false)
      expect(result.value).toBe("")
      expect(result.transformations).toEqual([])
    })

    it("should handle whitespace-only string", () => {
      const result = processClassNames("   ")

      expect(result.applied).toBe(false)
      expect(result.value).toBe("")
      expect(result.transformations).toEqual([])
    })

    it("should handle single class", () => {
      const result = processClassNames("mt-4")

      expect(result.applied).toBe(false)
      expect(result.value).toBe("mt-4")
      expect(result.transformations).toEqual([])
    })

    it("should handle multiple shorthand transformations", () => {
      const result = processClassNames(
        "mt-4 mr-4 mb-4 ml-4 pt-2 pr-2 pb-2 pl-2",
      )

      expect(result.applied).toBe(true)
      expect(result.value).toBe("m-4 p-2")
      expect(result.transformations).toHaveLength(2)
    })

    it("should preserve class order when applying shortcuts", () => {
      const result = processClassNames("flex mt-4 mr-4 mb-4 ml-4 items-center")

      expect(result.applied).toBe(true)
      expect(result.value).toBe("flex m-4 items-center")
    })

    it("should handle duplicate classes", () => {
      const result = processClassNames("mt-4 mt-4 mr-4 mb-4 ml-4")

      // Should only combine mr-4 and ml-4 into mx-4, keeping duplicates as-is
      expect(result.applied).toBe(true)
      expect(result.value).toBe("mt-4 mt-4 mx-4 mb-4")
      expect(result.transformations).toHaveLength(1)
      expect(result.transformations[0]).toEqual({
        shorthand: "mx-4",
        classnames: "mr-4, ml-4",
      })
    })

    it("should handle classes with different spacing", () => {
      const result = processClassNames("mt-4  mr-4   mb-4    ml-4")

      expect(result.applied).toBe(true)
      expect(result.value).toBe("m-4")
    })

    it("should handle important modifier classes", () => {
      const result = processClassNames("!mt-4 !mr-4 !mb-4 !ml-4")

      expect(result.applied).toBe(true)
      expect(result.value).toBe("!m-4")
    })
  })
})
