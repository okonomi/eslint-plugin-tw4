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
  describe("compact reports", () => {
    it.each([
      {
        code: `
          <div class="border-t-1 border-x-1 border-b-1" />
        `,
        output: `
          <div class="border-1" />
        `,
        errors: [
          generateError(["border-t-1", "border-x-1", "border-b-1"], "border-1"),
        ],
      },
      {
        code: `
          <div class="p-2 pl-2 pr-2">
            Issue #182
          </div>
        `,
        output: `
          <div class="p-2">
            Issue #182
          </div>
        `,
        errors: [generateError(["p-2", "pl-2", "pr-2"], "p-2")],
      },
    ])("should multiple reports into one", async (params) => {
      await invalid(params)
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

  describe("callExpression - Phase 1.1", () => {
    describe("basic string arguments", () => {
      it.each([
        {
          code: `classnames('w-1 h-1')`,
          output: `classnames('size-1')`,
          errors: [generateError(["w-1", "h-1"], "size-1")],
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `clsx('px-4 py-4')`,
          output: `clsx('p-4')`,
          errors: [generateError(["px-4", "py-4"], "p-4")],
          options: [{ callees: ["clsx"] }],
        },
        {
          code: `cn('mt-2 mb-2')`,
          output: `cn('my-2')`,
          errors: [generateError(["mt-2", "mb-2"], "my-2")],
          options: [{ callees: ["cn"] }],
        },
        {
          code: `classnames('border-l-0 border-r-0')`,
          output: `classnames('border-x-0')`,
          errors: [generateError(["border-l-0", "border-r-0"], "border-x-0")],
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `twMerge('overflow-x-auto overflow-y-auto')`,
          output: `twMerge('overflow-auto')`,
          errors: [
            generateError(
              ["overflow-x-auto", "overflow-y-auto"],
              "overflow-auto",
            ),
          ],
          options: [{ callees: ["twMerge"] }],
        },
      ])(
        "should transform single string argument: $code",
        async ({ code, output, errors, options }) => {
          const { result } = await invalid({ code, output, errors, options })
          expect(result.output).toEqual(output)
        },
      )
    })

    describe("valid cases - no transformation needed", () => {
      it.each([
        {
          code: `classnames('w-1 h-2')`, // Different values
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `classnames('w-1')`, // Single class
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `notInCallees('w-1 h-1')`, // Function not in callees
          options: [{ callees: ["classnames"] }],
        },
        {
          code: "classnames()", // No arguments
          options: [{ callees: ["classnames"] }],
        },
        {
          code: "classnames(variable)", // Non-literal argument
          options: [{ callees: ["classnames"] }],
        },
      ])("should not transform: $code", async ({ code, options }) => {
        const { result } = await valid({ code, options })
        expect(result.output).toEqual(code)
      })
    })

    describe("multiple callees configuration", () => {
      it("should work with multiple function names", async () => {
        const options = [{ callees: ["classnames", "clsx", "cn"] }]

        const testCases = [
          {
            code: `classnames('w-1 h-1')`,
            output: `classnames('size-1')`,
          },
          {
            code: `clsx('px-2 py-2')`,
            output: `clsx('p-2')`,
          },
          {
            code: `cn('ml-3 mr-3')`,
            output: `cn('mx-3')`,
          },
        ]

        for (const { code, output } of testCases) {
          const { result } = await invalid({
            code,
            output,
            errors: [
              generateError(
                code.includes("w-1")
                  ? ["w-1", "h-1"]
                  : code.includes("px-2")
                    ? ["px-2", "py-2"]
                    : ["ml-3", "mr-3"],
                code.includes("w-1")
                  ? "size-1"
                  : code.includes("px-2")
                    ? "p-2"
                    : "mx-3",
              ),
            ],
            options,
          })
          expect(result.output).toEqual(output)
        }
      })
    })

    describe("prefix and separator support", () => {
      it("should handle prefixed class names", async () => {
        const { result } = await invalid({
          code: `classnames('tw-border-l-0 tw-border-r-0')`,
          output: `classnames('tw-border-x-0')`,
          errors: [
            generateError(["tw-border-l-0", "tw-border-r-0"], "tw-border-x-0"),
          ],
          options: [
            {
              callees: ["classnames"],
              config: { prefix: "tw-" },
            },
          ],
        })
        expect(result.output).toEqual(`classnames('tw-border-x-0')`)
      })

      it("should handle custom separator", async () => {
        const { result } = await invalid({
          code: `classnames('md_tw-border-l-0 md_tw-border-r-0')`,
          output: `classnames('md_tw-border-x-0')`,
          errors: [
            generateError(
              ["md_tw-border-l-0", "md_tw-border-r-0"],
              "md_tw-border-x-0",
            ),
          ],
          options: [
            {
              callees: ["classnames"],
              config: { prefix: "tw-", separator: "_" },
            },
          ],
        })
        expect(result.output).toEqual(`classnames('md_tw-border-x-0')`)
      })
    })
  })

  describe("callExpression - Phase 1.2", () => {
    describe("array with string as first element", () => {
      it.each([
        {
          code: `classnames(['w-1 h-1'])`,
          output: `classnames(['size-1'])`,
          errors: [generateError(["w-1", "h-1"], "size-1")],
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `clsx(['px-4 py-4'])`,
          output: `clsx(['p-4'])`,
          errors: [generateError(["px-4", "py-4"], "p-4")],
          options: [{ callees: ["clsx"] }],
        },
        {
          code: `classnames(['mt-2 mb-2'])`,
          output: `classnames(['my-2'])`,
          errors: [generateError(["mt-2", "mb-2"], "my-2")],
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `classnames(['border-l-0 border-r-0'])`,
          output: `classnames(['border-x-0'])`,
          errors: [generateError(["border-l-0", "border-r-0"], "border-x-0")],
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `classnames(['overflow-x-auto overflow-y-auto'])`,
          output: `classnames(['overflow-auto'])`,
          errors: [
            generateError(
              ["overflow-x-auto", "overflow-y-auto"],
              "overflow-auto",
            ),
          ],
          options: [{ callees: ["classnames"] }],
        },
      ])(
        "should transform array with string: $code",
        async ({ code, output, errors, options }) => {
          const { result } = await invalid({ code, output, errors, options })
          expect(result.output).toEqual(output)
        },
      )
    })

    describe("array with multiple elements", () => {
      it("should only transform first element when it's a string", async () => {
        const { result } = await invalid({
          code: `classnames(['w-1 h-1', 'block', condition && 'active'])`,
          output: `classnames(['size-1', 'block', condition && 'active'])`,
          errors: [generateError(["w-1", "h-1"], "size-1")],
          options: [{ callees: ["classnames"] }],
        })
        expect(result.output).toEqual(
          `classnames(['size-1', 'block', condition && 'active'])`,
        )
      })
    })

    describe("valid cases - no transformation needed", () => {
      it.each([
        {
          code: `classnames(['w-1 h-2'])`, // Different values
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `classnames(['w-1'])`, // Single class
          options: [{ callees: ["classnames"] }],
        },
        {
          code: "classnames([])", // Empty array
          options: [{ callees: ["classnames"] }],
        },
        {
          code: "classnames([variable])", // Non-literal first element
          options: [{ callees: ["classnames"] }],
        },
        {
          code: `classnames([condition && 'w-1 h-1'])`, // Non-literal first element
          options: [{ callees: ["classnames"] }],
        },
      ])("should not transform: $code", async ({ code, options }) => {
        const { result } = await valid({ code, options })
        expect(result.output).toEqual(code)
      })
    })
  })
})
