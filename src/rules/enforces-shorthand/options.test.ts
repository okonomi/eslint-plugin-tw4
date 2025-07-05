import { describe, expect, it } from "vitest"
import { DEFAULT_OPTIONS, parseOptions } from "./options"
import type { RuleOptions } from "./types"

describe("options", () => {
  describe("DEFAULT_OPTIONS", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_OPTIONS).toEqual({
        callees: ["classnames", "clsx", "ctl", "cva"],
        config: {},
        skipClassAttribute: false,
        tags: ["tw", "styled", "myTag"],
      })
    })

    it("should have the correct types", () => {
      expect(Array.isArray(DEFAULT_OPTIONS.callees)).toBe(true)
      expect(typeof DEFAULT_OPTIONS.config).toBe("object")
      expect(typeof DEFAULT_OPTIONS.skipClassAttribute).toBe("boolean")
      expect(Array.isArray(DEFAULT_OPTIONS.tags)).toBe(true)
    })
  })

  describe("parseOptions", () => {
    it("should return default options when no options provided", () => {
      const result = parseOptions()
      expect(result).toEqual(DEFAULT_OPTIONS)
    })

    it("should return default options when empty object provided", () => {
      const result = parseOptions({})
      expect(result).toEqual(DEFAULT_OPTIONS)
    })

    it("should override callees when provided", () => {
      const customCallees = ["customClassnames", "customClsx"]
      const result = parseOptions({ callees: customCallees })

      expect(result.callees).toEqual(customCallees)
      expect(result.config).toEqual(DEFAULT_OPTIONS.config)
      expect(result.skipClassAttribute).toEqual(
        DEFAULT_OPTIONS.skipClassAttribute,
      )
      expect(result.tags).toEqual(DEFAULT_OPTIONS.tags)
    })

    it("should override config when provided", () => {
      const customConfig = { theme: { colors: {} } }
      const result = parseOptions({ config: customConfig })

      expect(result.callees).toEqual(DEFAULT_OPTIONS.callees)
      expect(result.config).toEqual(customConfig)
      expect(result.skipClassAttribute).toEqual(
        DEFAULT_OPTIONS.skipClassAttribute,
      )
      expect(result.tags).toEqual(DEFAULT_OPTIONS.tags)
    })

    it("should override skipClassAttribute when provided", () => {
      const result = parseOptions({ skipClassAttribute: true })

      expect(result.callees).toEqual(DEFAULT_OPTIONS.callees)
      expect(result.config).toEqual(DEFAULT_OPTIONS.config)
      expect(result.skipClassAttribute).toBe(true)
      expect(result.tags).toEqual(DEFAULT_OPTIONS.tags)
    })

    it("should override tags when provided", () => {
      const customTags = ["customTw", "customStyled"]
      const result = parseOptions({ tags: customTags })

      expect(result.callees).toEqual(DEFAULT_OPTIONS.callees)
      expect(result.config).toEqual(DEFAULT_OPTIONS.config)
      expect(result.skipClassAttribute).toEqual(
        DEFAULT_OPTIONS.skipClassAttribute,
      )
      expect(result.tags).toEqual(customTags)
    })

    it("should override multiple options when provided", () => {
      const customOptions: RuleOptions = {
        callees: ["customClassnames"],
        config: { custom: "config" },
        skipClassAttribute: true,
        tags: ["customTag"],
      }
      const result = parseOptions(customOptions)

      expect(result).toEqual({
        callees: ["customClassnames"],
        config: { custom: "config" },
        skipClassAttribute: true,
        tags: ["customTag"],
      })
    })

    it("should handle partial options correctly", () => {
      const result = parseOptions({ callees: ["onlyThis"] })

      expect(result.callees).toEqual(["onlyThis"])
      expect(result.config).toEqual(DEFAULT_OPTIONS.config)
      expect(result.skipClassAttribute).toEqual(
        DEFAULT_OPTIONS.skipClassAttribute,
      )
      expect(result.tags).toEqual(DEFAULT_OPTIONS.tags)
    })

    it("should handle empty arrays", () => {
      const result = parseOptions({
        callees: [],
        tags: [],
      })

      expect(result.callees).toEqual([])
      expect(result.tags).toEqual([])
      expect(result.config).toEqual(DEFAULT_OPTIONS.config)
      expect(result.skipClassAttribute).toEqual(
        DEFAULT_OPTIONS.skipClassAttribute,
      )
    })

    it("should handle string config", () => {
      const result = parseOptions({ config: "path/to/config" })

      expect(result.config).toBe("path/to/config")
      expect(result.callees).toEqual(DEFAULT_OPTIONS.callees)
      expect(result.skipClassAttribute).toEqual(
        DEFAULT_OPTIONS.skipClassAttribute,
      )
      expect(result.tags).toEqual(DEFAULT_OPTIONS.tags)
    })

    it("should handle false skipClassAttribute explicitly", () => {
      const result = parseOptions({ skipClassAttribute: false })

      expect(result.skipClassAttribute).toBe(false)
      expect(result.callees).toEqual(DEFAULT_OPTIONS.callees)
      expect(result.config).toEqual(DEFAULT_OPTIONS.config)
      expect(result.tags).toEqual(DEFAULT_OPTIONS.tags)
    })

    it("should preserve object references for config", () => {
      const configObject = { theme: { spacing: {} } }
      const result = parseOptions({ config: configObject })

      expect(result.config).toBe(configObject)
    })

    it("should preserve array references for callees and tags", () => {
      const customCallees = ["test"]
      const customTags = ["test"]
      const result = parseOptions({
        callees: customCallees,
        tags: customTags,
      })

      expect(result.callees).toBe(customCallees)
      expect(result.tags).toBe(customTags)
    })
  })

  describe("type safety", () => {
    it("should work with RuleOptions type", () => {
      const options: RuleOptions = {
        callees: ["test"],
        config: {},
        skipClassAttribute: true,
        tags: ["test"],
      }

      const result = parseOptions(options)
      expect(result).toEqual(options)
    })

    it("should work with partial RuleOptions type", () => {
      const options: Partial<RuleOptions> = {
        callees: ["test"],
      }

      const result = parseOptions(options)
      expect(result.callees).toEqual(["test"])
    })
  })
})
