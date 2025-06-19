import { describe, expect, it } from "vitest"
import { shorthand } from "./shorthand"

describe("shorthand", () => {
  describe("simple cases", () => {
    it.each([
      ["w-4 h-4", "size-4"],
      ["w-auto h-auto", "size-auto"],
      ["w-px h-px", "size-px"],
      ["w-full h-full", "size-full"],
      ["w-dvh h-dvh", "size-dvh"],
      ["w-fit h-fit", "size-fit"],
      ["w-[100px] h-[100px]", "size-[100px]"],
      ["w-(--var) h-(--var)", "size-(--var)"],
    ])('should convert "%s" to "%s"', (input, expected) => {
      expect(shorthand(input)).toBe(expected)
    })
  })
  describe("another class is in between", () => {
    it.each([
      ["w-1 block h-1", "size-1 block"],
      ["block w-1 h-1", "block size-1"],
      ["w-1 h-1 block", "size-1 block"],
      ["black w-1 bg-white h-1 mt-1", "black size-1 bg-white mt-1"],
    ])('should convert "%s" to "%s"', (input, expected) => {
      expect(shorthand(input)).toBe(expected)
    })
  })
  it.each([["w-1 h-2", "w-1 h-2"]])(
    "should return %s as is",
    (input, expected) => {
      expect(shorthand(input)).toBe(expected)
    },
  )
})
