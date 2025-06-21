import dedent from "dedent"
import { createRuleTester } from "eslint-vitest-rule-tester"
import { describe, expect, it } from "vitest"

import rule from "./enforces-shorthand"

function generateError(classnames: string[], shorthand: string) {
  return {
    messageId: "useShorthand",
    data: {
      classnames: classnames.join(" "),
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

  describe("sizing", () => {
    describe("valid", () => {
      it.each([
        { code: `<div className="size-1" />` },
        { code: `<div className="w-1 h-2" />` },
      ])("should not report valid code: $code", async ({ code }) => {
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
      ])(
        "should report invalid code: $code",
        async ({ code, output, errors }) => {
          const { result } = await invalid({ code, output, errors })
          expect(result.output).toEqual(output)
        },
      )
    })
  })
})
