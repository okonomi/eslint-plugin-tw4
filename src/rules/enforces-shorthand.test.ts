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
      const code = `
        <div className="size-1" />
      `
      const { result } = await valid({ code })
      expect(result.messages).toHaveLength(0)
    })
    it("should report invalid identifiers", async () => {
      const code = `
        <div className="w-1 h-1" />
      `
      const { result } = await invalid({
        code,
        errors: [{ messageId: "useShorthand" }],
      })
      expect(result.output).toMatchSnapshot()
    })
    it("when another class is in between", async () => {
      const code = `
      <div className="w-1 block h-1" />
      `
      const { result } = await invalid({
        code,
        errors: [{ messageId: "useShorthand" }],
      })
      expect(result.output).toMatchSnapshot()
    })
  })
})
