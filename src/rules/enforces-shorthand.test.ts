import dedent from "dedent"
import { createRuleTester } from "eslint-vitest-rule-tester"
import { describe, expect, it } from "vitest"

import rule from "./enforces-shorthand"

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
          errors: [
            {
              messageId: "useShorthand",
              data: {
                shorthand: "size-1",
                classnames: "w-1 h-1",
              },
            },
          ],
          message: 'Use shorthand "size-1" instead of class names "w-1 h-1".',
        },
        {
          code: `<div className="w-1 block h-1" />`,
          output: `<div className="size-1 block" />`,
          errors: [
            {
              messageId: "useShorthand",
              data: {
                shorthand: "size-1",
                classnames: "w-1 h-1",
              },
            },
          ],
          message: 'Use shorthand "size-1" instead of class names "w-1 h-1".',
        },
        {
          code: `<div className="w-2 h-2" />`,
          output: `<div className="size-2" />`,
          errors: [
            {
              messageId: "useShorthand",
              data: {
                shorthand: "size-2",
                classnames: "w-2 h-2",
              },
            },
          ],
          message: 'Use shorthand "size-2" instead of class names "w-2 h-2".',
        },
        {
          code: `<div className="w-auto h-auto" />`,
          output: `<div className="size-auto" />`,
          errors: [
            {
              messageId: "useShorthand",
              data: {
                shorthand: "size-auto",
                classnames: "w-auto h-auto",
              },
            },
          ],
          message:
            'Use shorthand "size-auto" instead of class names "w-auto h-auto".',
        },
      ])(
        "should report invalid code: $code",
        async ({ code, output, errors, message }) => {
          const { result } = await invalid({ code, output, errors })
          expect(result.output).toEqual(output)
          expect(result.messages[0].message).toEqual(message)
        },
      )
    })
  })
})
