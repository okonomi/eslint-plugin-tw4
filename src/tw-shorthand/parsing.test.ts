import { describe, expect, it } from "vitest"

import { type ParsedClassInfo, parseClasses } from "./parsing"

describe("parseClasses", () => {
  it.each<[string, ParsedClassInfo]>([
    [
      "bg-red-500",
      {
        original: "bg-red-500",
        parsed: { prefix: "", baseClass: "bg-red-500" },
        baseParsed: {
          type: "bg",
          value: "red-500",
          isNegative: false,
        },
      },
    ],
    [
      "md:text-lg",
      {
        original: "md:text-lg",
        parsed: { prefix: "md:", baseClass: "text-lg" },
        baseParsed: {
          type: "text",
          value: "lg",
          isNegative: false,
        },
      },
    ],
    [
      "border-2",
      {
        original: "border-2",
        parsed: { prefix: "", baseClass: "border-2" },
        baseParsed: {
          type: "border",
          category: "border-width-color",
          value: "2",
          isNegative: false,
        },
      },
    ],
    [
      "-m-4",
      {
        original: "-m-4",
        parsed: { prefix: "", baseClass: "-m-4" },
        baseParsed: {
          type: "m",
          value: "4",
          isNegative: true,
        },
      },
    ],
    [
      "rounded-full",
      {
        original: "rounded-full",
        parsed: { prefix: "", baseClass: "rounded-full" },
        baseParsed: {
          type: "rounded",
          category: "border-radius",
          value: "full",
          isNegative: false,
        },
      },
    ],
    [
      "inset-0",
      {
        original: "inset-0",
        parsed: { prefix: "", baseClass: "inset-0" },
        baseParsed: {
          type: "inset",
          category: "layout-inset",
          value: "0",
          isNegative: false,
        },
      },
    ],
    [
      "scroll-m-8",
      {
        original: "scroll-m-8",
        parsed: { prefix: "", baseClass: "scroll-m-8" },
        baseParsed: {
          type: "scroll-m",
          category: "layout-scroll",
          value: "8",
          isNegative: false,
        },
      },
    ],
    [
      "gap-x-2",
      {
        original: "gap-x-2",
        parsed: { prefix: "", baseClass: "gap-x-2" },
        baseParsed: {
          type: "gap-x",
          category: "layout-gap",
          value: "2",
          isNegative: false,
        },
      },
    ],
    [
      "grid-cols-3",
      {
        original: "grid-cols-3",
        parsed: { prefix: "", baseClass: "grid-cols-3" },
        baseParsed: {
          type: "grid",
          value: "cols-3",
          isNegative: false,
        },
      },
    ],
    [
      "transform-gpu",
      {
        original: "transform-gpu",
        parsed: { prefix: "", baseClass: "transform-gpu" },
        baseParsed: {
          type: "transform",
          value: "gpu",
          isNegative: false,
        },
      },
    ],
    [
      "overflow-hidden",
      {
        original: "overflow-hidden",
        parsed: { prefix: "", baseClass: "overflow-hidden" },
        baseParsed: {
          type: "overflow",
          category: "misc",
          value: "hidden",
          isNegative: false,
        },
      },
    ],
    [
      "overscroll-auto",
      {
        original: "overscroll-auto",
        parsed: { prefix: "", baseClass: "overscroll-auto" },
        baseParsed: {
          type: "overscroll",
          category: "misc",
          value: "auto",
          isNegative: false,
        },
      },
    ],
  ])("should parse %s correctly", (original, expected) => {
    const result = parseClasses([original])
    expect(result).toEqual([expected])
  })
})
