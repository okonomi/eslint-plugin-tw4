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

  describe("size shorthand", () => {
    it("should not report valid identifiers", async () => {
      const code = dedent`
        <div className="size-1" />
      `
      const { result } = await valid({ code })
      expect(result.messages).toHaveLength(0)
    })
    it("when width and height are different", async () => {
      const code = dedent`
        <div className="w-1 h-2" />
      `
      const { result } = await valid({ code })
      expect(result.output).toMatchSnapshot()
    })
    it("should report invalid identifiers", async () => {
      const code = dedent`
        <div className="w-1 h-1" />
      `
      const { result } = await invalid({
        code,
        errors: [{ messageId: "useShorthand" }],
      })
      expect(result.output).toMatchSnapshot()
    })
    it("when another class is in between", async () => {
      const code = dedent`
        <div className="w-1 block h-1" />
      `
      const { result } = await invalid({
        code,
        errors: [{ messageId: "useShorthand" }],
      })
      expect(result.output).toMatchSnapshot()
      expect(result.output).toEqual(dedent`
        <div className="size-1 block" />
      `)
    })
    it("when size is 2", async () => {
      const code = dedent`
        <div className="w-2 h-2" />
      `
      const { result } = await invalid({
        code,
        errors: [{ messageId: "useShorthand" }],
      })
      expect(result.output).toMatchSnapshot()
    })
    it("when size is non-numeric", async () => {
      const code = dedent`
        <div className="w-auto h-auto" />
      `
      const { result } = await invalid({
        code,
        errors: [{ messageId: "useShorthand" }],
      })
      expect(result.output).toMatchSnapshot()
    })
  })
})
