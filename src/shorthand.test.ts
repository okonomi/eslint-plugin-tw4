import { describe, expect, it } from "vitest"
import { applyShorthand } from "./shorthand"

describe("shorthand", () => {
  describe("simple cases", () => {
    it.each([
      ["w-[100px] h-[100px]", "size-[100px]"],
      ["w-(--var) h-(--var)", "size-(--var)"],
      ["lg:w-1 lg:h-1", "lg:size-1"],
    ])('should convert "%s" to "%s"', (input, expected) => {
      expect(applyShorthand(input).value).toBe(expected)
    })
  })
  describe("another class is in between", () => {
    it.each([
      {
        input: "w-1 block h-1",
        expected: "size-1 block",
        classnames: "w-1 h-1",
        shorthand: "size-1",
      },
      {
        input: "block w-1 h-1",
        expected: "block size-1",
        classnames: "w-1 h-1",
        shorthand: "size-1",
      },
      {
        input: "w-1 h-1 block",
        expected: "size-1 block",
        classnames: "w-1 h-1",
        shorthand: "size-1",
      },
      {
        input: "black w-1 bg-white h-1 mt-1",
        expected: "black size-1 bg-white mt-1",
        classnames: "w-1 h-1",
        shorthand: "size-1",
      },
    ])(
      'should convert "%s" to "%s"',
      ({ input, expected, classnames, shorthand }) => {
        expect(applyShorthand(input)).toStrictEqual({
          applied: true,
          value: expected,
          classnames,
          shorthand,
        })
      },
    )
  })
  it.each([["w-1 h-2", "w-1 h-2"]])(
    "should return %s as is",
    (input, expected) => {
      expect(applyShorthand(input).value).toBe(expected)
    },
  )
  describe("spacing", () => {
    it.each([
      ["mx-1 my-1", "m-1"],
      ["px-1 py-1", "p-1"],
      ["mt-1 mb-1 mr-1 ml-1", "m-1"],
    ])('"%s" to "%s"', (input, expected) => {
      expect(applyShorthand(input).value).toBe(expected)
    })
  })
  describe.skip("border", () => {
    // TODO: ボーダー関連のショートハンドを実装
  })
  describe.skip("layout", () => {
    // TODO: レイアウト関連のショートハンドを実装
  })
  describe("sizing", () => {
    it.each([
      ["w-1 h-1", "size-1"],
      ["w-4 h-4", "size-4"],
      ["w-auto h-auto", "size-auto"],
      ["w-px h-px", "size-px"],
      ["w-full h-full", "size-full"],
      ["w-dvh h-dvh", "size-dvh"],
      ["w-fit h-fit", "size-fit"],
    ])('"%s" to "%s"', (input, expected) => {
      expect(applyShorthand(input).value).toBe(expected)
    })
  })
  describe.skip("grid & flexbox", () => {
    // TODO: グリッド・フレックスボックス関連のショートハンドを実装
  })
  describe.skip("transform", () => {
    // TODO: トランスフォーム関連のショートハンドを実装
  })
  describe.skip("typography", () => {
    // TODO: タイポグラフィ関連のショートハンドを実装
  })
  describe.skip("misc", () => {
    // TODO: その他のショートハンドを実装
  })
})
