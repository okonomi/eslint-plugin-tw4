import { describe, expect, it } from "vitest"
import { applyAllShorthands, applyShorthand } from "./shorthand"

describe("shorthand", () => {
  describe("no effect", () => {
    it.each(["overflow-hidden text-ellipsis hover:whitespace-nowrap"])(
      'should return "%s" as is',
      (input) => {
        expect(applyShorthand(input).value).toBe(input)
      },
    )
  })
  describe("simple cases", () => {
    it.each([
      ["w-[100px] h-[100px]", "size-[100px]"],
      ["w-(--var) h-(--var)", "size-(--var)"],
      ["lg:w-1 lg:h-1", "lg:size-1"],
    ])('should convert "%s" to "%s"', (input, expected) => {
      expect(applyShorthand(input).value).toBe(expected)
    })
  })
  describe("classes order", () => {
    it.each([
      ["h-1 w-1", "h-1, w-1"],
      ["py-1 px-1", "py-1, px-1"],
    ])('should keep classes order "%s"', (input, expected) => {
      expect(applyShorthand(input).classnames).toBe(expected)
    })
  })
  describe("another class is in between", () => {
    it.each([
      {
        input: "w-1 block h-1",
        expected: "size-1 block",
        classnames: "w-1, h-1",
        shorthand: "size-1",
      },
      {
        input: "block w-1 h-1",
        expected: "block size-1",
        classnames: "w-1, h-1",
        shorthand: "size-1",
      },
      {
        input: "w-1 h-1 block",
        expected: "size-1 block",
        classnames: "w-1, h-1",
        shorthand: "size-1",
      },
      {
        input: "black w-1 bg-white h-1 mt-1",
        expected: "black size-1 bg-white mt-1",
        classnames: "w-1, h-1",
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
    describe("padding", () => {
      it.each([
        ["pt-1 pb-1", "py-1"],
        ["ps-1 pe-1", "px-1"],
        ["pl-1 pr-1", "px-1"],
        ["px-1 py-1", "p-1"],
        ["pt-1 pb-1 pr-1 pl-1", "p-1"],
        ["pt-1 pb-1 ps-1 pe-1", "p-1"],
      ])('"%s" to "%s"', (input, expected) =>
        expect(applyShorthand(input).value).toBe(expected),
      )
    })
    describe("margin", () => {
      it.each([
        ["mt-1 mb-1", "my-1"],
        ["ms-1 me-1", "mx-1"],
        ["ml-1 mr-1", "mx-1"],
        ["mx-1 my-1", "m-1"],
        ["mt-1 mb-1 mr-1 ml-1", "m-1"],
        ["mt-1 mb-1 ms-1 me-1", "m-1"],

        ["-mt-1 -mb-1", "-my-1"],
        ["-ms-1 -me-1", "-mx-1"],
        ["-ml-1 -mr-1", "-mx-1"],
        ["-mx-1 -my-1", "-m-1"],
        ["-mt-1 -mb-1 -mr-1 -ml-1", "-m-1"],
        ["-mt-1 -mb-1 -ms-1 -me-1", "-m-1"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })
  })
  describe("border", () => {
    describe("border width", () => {
      it.each([
        // 2-way patterns
        ["border-t-1 border-b-1", "border-y-1"],
        ["border-l-1 border-r-1", "border-x-1"],
        ["border-s-1 border-e-1", "border-x-1"],
        ["border-x-1 border-y-1", "border-1"],

        // 4-way patterns
        ["border-t-1 border-b-1 border-l-1 border-r-1", "border-1"],
        ["border-t-1 border-b-1 border-s-1 border-e-1", "border-1"],

        // Different values
        ["border-t-2 border-b-2", "border-y-2"],
        ["border-l-4 border-r-4", "border-x-4"],
        ["border-x-0 border-y-0", "border-0"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("border color", () => {
      it.each([
        // 2-way patterns
        ["border-t-red-500 border-b-red-500", "border-y-red-500"],
        ["border-l-blue-300 border-r-blue-300", "border-x-blue-300"],
        ["border-s-green-400 border-e-green-400", "border-x-green-400"],
        ["border-x-gray-200 border-y-gray-200", "border-gray-200"],

        // 4-way patterns
        [
          "border-t-black border-b-black border-l-black border-r-black",
          "border-black",
        ],
        [
          "border-t-white border-b-white border-s-white border-e-white",
          "border-white",
        ],

        // With transparency
        ["border-t-red-500/50 border-b-red-500/50", "border-y-red-500/50"],
        ["border-x-blue-300/25 border-y-blue-300/25", "border-blue-300/25"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("border radius", () => {
      it.each([
        // Corner pairs to sides
        ["rounded-tl-md rounded-tr-md", "rounded-t-md"],
        ["rounded-bl-md rounded-br-md", "rounded-b-md"],
        ["rounded-tl-md rounded-bl-md", "rounded-l-md"],
        ["rounded-tr-md rounded-br-md", "rounded-r-md"],
        ["rounded-ss-md rounded-se-md", "rounded-s-md"],
        ["rounded-es-md rounded-ee-md", "rounded-e-md"],

        // Side pairs to full
        ["rounded-t-md rounded-b-md", "rounded-md"],
        ["rounded-l-md rounded-r-md", "rounded-md"],
        ["rounded-s-md rounded-e-md", "rounded-md"],

        // 4-corner to full
        [
          "rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-lg",
          "rounded-lg",
        ],
        [
          "rounded-ss-sm rounded-se-sm rounded-es-sm rounded-ee-sm",
          "rounded-sm",
        ],

        // 2-corners and 1-side to full
        ["rounded-tl rounded-tr rounded-b", "rounded"],
        ["rounded-bl-lg rounded-br-lg rounded-t-lg", "rounded-lg"],
        ["rounded-tl-sm rounded-bl-sm rounded-r-sm", "rounded-sm"],
        ["rounded-tr-md rounded-br-md rounded-l-md", "rounded-md"],

        // start/end patterns
        ["rounded-ss rounded-se rounded-b", "rounded"],
        ["rounded-es-lg rounded-ee-lg rounded-t-lg", "rounded-lg"],
        ["rounded-ss-sm rounded-es-sm rounded-e-sm", "rounded-sm"],
        ["rounded-se-md rounded-ee-md rounded-s-md", "rounded-md"],

        // Different sizes
        ["rounded-tl-full rounded-tr-full", "rounded-t-full"],
        ["rounded-t-none rounded-b-none", "rounded-none"],
        ["rounded-l-xl rounded-r-xl", "rounded-xl"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })
  })
  describe("layout", () => {
    describe("inset", () => {
      it.each([
        // 2-way patterns
        ["top-1 bottom-1", "inset-y-1"],
        ["left-1 right-1", "inset-x-1"],
        ["start-1 end-1", "inset-x-1"],
        ["inset-x-1 inset-y-1", "inset-1"],

        // 4-way patterns
        ["top-1 bottom-1 left-1 right-1", "inset-1"],
        ["top-1 bottom-1 start-1 end-1", "inset-1"],

        // Different values
        ["top-auto bottom-auto", "inset-y-auto"],
        ["left-0 right-0", "inset-x-0"],
        ["start-px end-px", "inset-x-px"],
        ["inset-x-full inset-y-full", "inset-full"],

        // Negative values
        ["-top-1 -bottom-1", "-inset-y-1"],
        ["-left-2 -right-2", "-inset-x-2"],
        ["-start-4 -end-4", "-inset-x-4"],
        ["-inset-x-1 -inset-y-1", "-inset-1"],

        // Fractional values
        ["top-1/2 bottom-1/2", "inset-y-1/2"],
        ["left-1/3 right-1/3", "inset-x-1/3"],
        ["start-2/3 end-2/3", "inset-x-2/3"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("scroll margin", () => {
      it.each([
        // 2-way patterns
        ["scroll-mt-1 scroll-mb-1", "scroll-my-1"],
        ["scroll-ml-1 scroll-mr-1", "scroll-mx-1"],
        ["scroll-ms-1 scroll-me-1", "scroll-mx-1"],
        ["scroll-mx-1 scroll-my-1", "scroll-m-1"],

        // 4-way patterns
        ["scroll-mt-1 scroll-mb-1 scroll-ml-1 scroll-mr-1", "scroll-m-1"],
        ["scroll-mt-1 scroll-mb-1 scroll-ms-1 scroll-me-1", "scroll-m-1"],

        // Different values
        ["scroll-mt-4 scroll-mb-4", "scroll-my-4"],
        ["scroll-ml-auto scroll-mr-auto", "scroll-mx-auto"],
        ["scroll-ms-px scroll-me-px", "scroll-mx-px"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("scroll padding", () => {
      it.each([
        // 2-way patterns
        ["scroll-pt-1 scroll-pb-1", "scroll-py-1"],
        ["scroll-pl-1 scroll-pr-1", "scroll-px-1"],
        ["scroll-ps-1 scroll-pe-1", "scroll-px-1"],
        ["scroll-px-1 scroll-py-1", "scroll-p-1"],

        // 4-way patterns
        ["scroll-pt-1 scroll-pb-1 scroll-pl-1 scroll-pr-1", "scroll-p-1"],
        ["scroll-pt-1 scroll-pb-1 scroll-ps-1 scroll-pe-1", "scroll-p-1"],

        // Different values
        ["scroll-pt-8 scroll-pb-8", "scroll-py-8"],
        ["scroll-pl-0 scroll-pr-0", "scroll-px-0"],
        ["scroll-ps-2 scroll-pe-2", "scroll-px-2"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("gap", () => {
      it.each([
        // 2-way gap patterns
        ["gap-x-1 gap-y-1", "gap-1"],
        ["gap-x-2 gap-y-2", "gap-2"],
        ["gap-x-4 gap-y-4", "gap-4"],
        ["gap-x-8 gap-y-8", "gap-8"],
        ["gap-x-px gap-y-px", "gap-px"],
        ["gap-x-0 gap-y-0", "gap-0"],
        ["gap-x-0.5 gap-y-0.5", "gap-0.5"],
        ["gap-x-1.5 gap-y-1.5", "gap-1.5"],
        ["gap-x-12 gap-y-12", "gap-12"],
        ["gap-x-16 gap-y-16", "gap-16"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })
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
  describe("grid & flexbox", () => {
    describe("place items", () => {
      it.each([
        // place-items は justify-items + align-items のショートハンド
        ["justify-items-center align-items-center", "place-items-center"],
        ["justify-items-start align-items-start", "place-items-start"],
        ["justify-items-end align-items-end", "place-items-end"],
        ["justify-items-stretch align-items-stretch", "place-items-stretch"],
        ["justify-items-baseline align-items-baseline", "place-items-baseline"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("place content", () => {
      it.each([
        // place-content は justify-content + align-content のショートハンド
        ["justify-content-center align-content-center", "place-content-center"],
        ["justify-content-start align-content-start", "place-content-start"],
        ["justify-content-end align-content-end", "place-content-end"],
        [
          "justify-content-between align-content-between",
          "place-content-between",
        ],
        ["justify-content-around align-content-around", "place-content-around"],
        ["justify-content-evenly align-content-evenly", "place-content-evenly"],
        [
          "justify-content-stretch align-content-stretch",
          "place-content-stretch",
        ],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("place self", () => {
      it.each([
        // place-self は justify-self + align-self のショートハンド
        ["justify-self-center align-self-center", "place-self-center"],
        ["justify-self-start align-self-start", "place-self-start"],
        ["justify-self-end align-self-end", "place-self-end"],
        ["justify-self-stretch align-self-stretch", "place-self-stretch"],
        ["justify-self-auto align-self-auto", "place-self-auto"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe.skip("order patterns", () => {
      // order-* は単一プロパティなのでショートハンドなし
    })

    describe.skip("flex patterns", () => {
      // flex-grow, flex-shrink, flex-basis の組み合わせ
      // 実際にはTailwindではこれらは個別のユーティリティのため、ショートハンドにはならない
      // flex-1, flex-auto, flex-none, flex-initial は既にショートハンド形式
    })
  })
  describe("transform", () => {
    describe("translate", () => {
      it.each([
        // Same values to shorthand
        ["translate-x-4 translate-y-4", "translate-4"],

        // Negative values
        ["-translate-x-4 -translate-y-4", "-translate-4"],

        // Fractional values
        ["translate-x-1/2 translate-y-1/2", "translate-1/2"],
        ["translate-x-full translate-y-full", "translate-full"],
        ["translate-x-px translate-y-px", "translate-px"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("scale", () => {
      it.each([
        // Same values to shorthand
        ["scale-x-100 scale-y-100", "scale-100"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })

    describe("skew", () => {
      it.each([
        // Same values to shorthand
        ["skew-x-12 skew-y-12", "skew-12"],

        // Negative values
        ["-skew-x-6 -skew-y-6", "-skew-6"],
      ])('"%s" to "%s"', (input, expected) => {
        expect(applyShorthand(input).value).toBe(expected)
      })
    })
  })
  describe.skip("typography", () => {
    // TODO: タイポグラフィ関連のショートハンドを実装
  })
  describe("misc", () => {
    it.each([
      ["overflow-hidden text-ellipsis whitespace-nowrap", "truncate"],

      // overflow patterns
      ["overflow-x-auto overflow-y-auto", "overflow-auto"],
      ["overflow-x-clip overflow-y-clip", "overflow-clip"],
      ["overflow-x-hidden overflow-y-hidden", "overflow-hidden"],
      ["overflow-x-scroll overflow-y-scroll", "overflow-scroll"],
      ["overflow-x-visible overflow-y-visible", "overflow-visible"],

      // overscroll patterns
      ["overscroll-x-auto overscroll-y-auto", "overscroll-auto"],
      ["overscroll-x-contain overscroll-y-contain", "overscroll-contain"],
      ["overscroll-x-none overscroll-y-none", "overscroll-none"],

      // border-spacing patterns
      ["border-spacing-x-1 border-spacing-y-1", "border-spacing-1"],
      ["border-spacing-x-2 border-spacing-y-2", "border-spacing-2"],
      ["border-spacing-x-px border-spacing-y-px", "border-spacing-px"],
      ["border-spacing-x-0 border-spacing-y-0", "border-spacing-0"],
    ])('"%s" to "%s"', (input, expected) => {
      expect(applyShorthand(input).value).toBe(expected)
    })
  })
})

describe("applyAllShorthands", () => {
  it.each([["md:w-1 md:h-1 lg:w-2 lg:h-2", "md:size-1 lg:size-2"]])(
    'should convert "%s" to "%s"',
    (input, expected) => {
      expect(applyAllShorthands(input).value).toBe(expected)
    },
  )
  describe("multiple shorthand classes", () => {
    it.each([
      ["mt-1 mb-1 md:mx-2 md:my-2", ["mt-1, mb-1", "md:mx-2, md:my-2"]],
    ])('should keep classes order "%s"', (input, expected) => {
      const result = applyAllShorthands(input)
      expect(
        result.transformations.map(({ classnames }) => classnames),
      ).toEqual(expected)
    })
  })
})
