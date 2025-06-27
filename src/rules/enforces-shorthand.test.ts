import { createRuleTester } from "eslint-vitest-rule-tester"
import { describe, expect, it } from "vitest"

import rule from "./enforces-shorthand"

function generateError(classnames: string[], shorthand: string) {
  return {
    messageId: "useShorthand",
    data: {
      classnames: classnames.join(", "),
      shorthand,
    },
  }
}

describe("enforces-shorthand", () => {
  const { valid, invalid } = createRuleTester({
    name: "enforces-shorthand",
    rule,
    configs: {
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
  })

  describe("attribute", () => {
    it("should not report if className is not present", async () => {
      const { result } = await valid({
        code: "<div />",
      })
      expect(result.output).toEqual("<div />")
    })
    it("should not report if className is empty", async () => {
      const { result } = await valid({
        code: "<div className={''} />",
      })
      expect(result.output).toEqual("<div className={''} />")
    })
    it("should report if class is present", async () => {
      const { result } = await invalid({
        code: `<div class="w-1 h-1" />`,
        output: `<div class="size-1" />`,
        errors: [generateError(["w-1", "h-1"], "size-1")],
      })
      expect(result.output).toEqual(`<div class="size-1" />`)
    })
  })
  describe("sizing", () => {
    describe("valid", () => {
      it.each([
        `<div className="size-1" />`,
        `<div className="w-1 h-2" />`,
        // `<div class="overflow-x-auto overflow-y-scroll" />`,
        // `<div class="overscroll-x-auto overscroll-y-none" />`,
        // `<div class="mt-0 mr-1 mb-3 ml-4" />`,
        // `<div class="top-[0] right-[50%] bottom-[10px] left-[var(--some-value)]" />`,
        // `<div class="top-[0] right-0 bottom-0 left-[0]" />`,
        // `<div class="grid gap-x-8 gap-y-4 grid-cols-3" />`,
        // `<img class="scale-x-75 -scale-y-75" />`,
        // `<div class="px-16 pt-48 pb-16" />`,
        `<div className="py-2.5 md:py-3 pl-2.5 md:pl-4 font-medium uppercase" />`,
        "<div className />",
        // `
        //       <div className={"px-0 py-[0]"}>skipClassAttribute</div>
        //       `,
        //           options: skipClassAttributeOptions,
        //         },
        // `<div class="group/name:rounded-r-full rounded-l-full" />`,
        // `<div class="overflow-hidden text-ellipsis hover:whitespace-nowrap" />`,
        // `<div class="overflow-hidden text-ellipsis !whitespace-nowrap" />`,
        // "<div className={`absolute inset-y-0 left-0 w-1/3 rounded-[inherit] shadow-lg ${className}`} />",
        "<div className={'w-screen h-screen'} />",
        //         {
        //           code: `<div class="h-custom w-custom">Incomplete config should not use size-*</div>`,
        //           options: incompleteCustomWidthHeightOptions,
        //         },
        //         {
        //           code: `<div class="h-custom w-custom">Ambiguous cannot size-*</div>`,
        //           options: ambiguousOptions,
        //         },
        //         {
        //           code: `<div class="h-custom w-custom">h-custom & w-custom don't exist... no size-*</div>`,
        //           options: customSizeOnlyOptions,
        //         },
      ])("should not report valid code: $code", async (code) => {
        const { result } = await valid({ code })
        expect(result.output).toEqual(code)
      })
    })
    describe("invalid", () => {
      it.each([
        {
          code: `<div className="w-1 h-1" />`,
          output: `<div className="size-1" />`,
          errors: [generateError(["w-1", "h-1"], "size-1")],
        },
        {
          code: `<div className="w-1 block h-1" />`,
          output: `<div className="size-1 block" />`,
          errors: [generateError(["w-1", "h-1"], "size-1")],
        },
        {
          code: `<div className="w-2 h-2" />`,
          output: `<div className="size-2" />`,
          errors: [generateError(["w-2", "h-2"], "size-2")],
        },
        {
          code: `<div className="w-auto h-auto" />`,
          output: `<div className="size-auto" />`,
          errors: [generateError(["w-auto", "h-auto"], "size-auto")],
        },
        {
          code: `<div className="w-1 h-1 mt-1 mb-1" />`,
          output: `<div className="size-1 my-1" />`,
          errors: [
            generateError(["w-1", "h-1"], "size-1"),
            generateError(["mt-1", "mb-1"], "my-1"),
          ],
        },
      ])(
        "should report invalid code: $code",
        async ({ code, output, errors }) => {
          const { result } = await invalid({ code, output, errors })
          expect(result.output).toEqual(output)
        },
      )
    })
  })
  describe("rule options", () => {
    it("should set options", async () => {
      const { result } = await invalid({
        code: `<div className="px-1 py-1" />`,
        options: [
          {
            callees: ["clsx", "classnames"],
            config: {
              size: {
                width: "w",
                height: "h",
              },
            },
            skipClassAttribute: true,
            tags: ["div", "span"],
          },
        ],
      })
      expect(result.output).toEqual(`<div className="p-1" />`)
    })
  })
})
