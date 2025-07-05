// =============================================================================
// Shorthand Functions - Using Improved ClassInfo Structure
// =============================================================================

import {
  emitBaseClassName,
  emitClassName,
} from "./tw-shorthand/class-info/emit"
import { parseClasses } from "./tw-shorthand/class-info/parse"
import type { ClassInfo } from "./tw-shorthand/class-info/type"

type ShorthandPattern = {
  patterns: string[][]
  shorthand: string
}

type MatchResult = {
  matches: { [key: string]: string }
  matchedClasses: string[]
  commonPrefix: string
  commonValue: string
  commonNegative: boolean
  commonImportant: "leading" | "trailing" | null
}

type ParsedTransformResult = {
  applied: boolean
  classInfos: ClassInfo[]
  matchedClasses?: string[]
  shorthandClass?: string
}

// =============================================================================
// Pattern Definition Constants
// =============================================================================
const SPACING_PATTERNS: ShorthandPattern[] = [
  // 4-way patterns (highest priority)
  {
    patterns: [
      ["mt", "mb", "mr", "ml"],
      ["mt", "mb", "ms", "me"],
    ],
    shorthand: "m",
  },
  {
    patterns: [
      ["pt", "pb", "pr", "pl"],
      ["pt", "pb", "ps", "pe"],
    ],
    shorthand: "p",
  },
  // 2-way patterns
  {
    patterns: [["mx", "my"]],
    shorthand: "m",
  },
  {
    patterns: [["px", "py"]],
    shorthand: "p",
  },
  {
    patterns: [["mt", "mb"]],
    shorthand: "my",
  },
  {
    patterns: [
      ["ms", "me"],
      ["ml", "mr"],
    ],
    shorthand: "mx",
  },
  {
    patterns: [["pt", "pb"]],
    shorthand: "py",
  },
  {
    patterns: [
      ["ps", "pe"],
      ["pl", "pr"],
    ],
    shorthand: "px",
  },
]

const BORDER_PATTERNS: ShorthandPattern[] = [
  // 4-way border patterns (highest priority)
  {
    patterns: [
      ["border-t", "border-b", "border-l", "border-r"],
      ["border-t", "border-b", "border-s", "border-e"],
    ],
    shorthand: "border",
  },
  // 3-way border patterns (border-y + left/right or border-x + top/bottom)
  {
    patterns: [
      ["border-y", "border-l", "border-r"],
      ["border-y", "border-s", "border-e"],
      ["border-x", "border-t", "border-b"],
    ],
    shorthand: "border",
  },
  // 2-way border patterns
  {
    patterns: [["border-x", "border-y"]],
    shorthand: "border",
  },
  {
    patterns: [["border-t", "border-b"]],
    shorthand: "border-y",
  },
  {
    patterns: [
      ["border-l", "border-r"],
      ["border-s", "border-e"],
    ],
    shorthand: "border-x",
  },
]

const BORDER_RADIUS_PATTERNS: ShorthandPattern[] = [
  // 4-corner to full
  {
    patterns: [
      ["rounded-tl", "rounded-tr", "rounded-bl", "rounded-br"],
      ["rounded-ss", "rounded-se", "rounded-es", "rounded-ee"],
    ],
    shorthand: "rounded",
  },
  // 2-corners and 1-side to full (highest priority for 3-element patterns)
  {
    patterns: [
      ["rounded-tl", "rounded-tr", "rounded-b"],
      ["rounded-bl", "rounded-br", "rounded-t"],
      ["rounded-tl", "rounded-bl", "rounded-r"],
      ["rounded-tr", "rounded-br", "rounded-l"],
    ],
    shorthand: "rounded",
  },
  // Start/End patterns for 2-corners and 1-side to full
  {
    patterns: [
      ["rounded-ss", "rounded-se", "rounded-b"],
      ["rounded-es", "rounded-ee", "rounded-t"],
      ["rounded-ss", "rounded-es", "rounded-e"],
      ["rounded-se", "rounded-ee", "rounded-s"],
    ],
    shorthand: "rounded",
  },
  // Side pairs to full
  {
    patterns: [
      ["rounded-t", "rounded-b"],
      ["rounded-l", "rounded-r"],
      ["rounded-s", "rounded-e"],
    ],
    shorthand: "rounded",
  },
  // Corner pairs to sides
  {
    patterns: [["rounded-tl", "rounded-tr"]],
    shorthand: "rounded-t",
  },
  {
    patterns: [["rounded-bl", "rounded-br"]],
    shorthand: "rounded-b",
  },
  {
    patterns: [["rounded-tl", "rounded-bl"]],
    shorthand: "rounded-l",
  },
  {
    patterns: [["rounded-tr", "rounded-br"]],
    shorthand: "rounded-r",
  },
  {
    patterns: [["rounded-ss", "rounded-se"]],
    shorthand: "rounded-s",
  },
  {
    patterns: [["rounded-es", "rounded-ee"]],
    shorthand: "rounded-e",
  },
]

const LAYOUT_PATTERNS: ShorthandPattern[] = [
  // 4-way inset patterns (highest priority)
  {
    patterns: [
      ["top", "bottom", "left", "right"],
      ["top", "bottom", "start", "end"],
    ],
    shorthand: "inset",
  },
  // 2-way inset patterns
  {
    patterns: [["inset-x", "inset-y"]],
    shorthand: "inset",
  },
  {
    patterns: [["top", "bottom"]],
    shorthand: "inset-y",
  },
  {
    patterns: [
      ["left", "right"],
      ["start", "end"],
    ],
    shorthand: "inset-x",
  },
  // Scroll margin patterns (4-way, highest priority)
  {
    patterns: [
      ["scroll-mt", "scroll-mb", "scroll-ml", "scroll-mr"],
      ["scroll-mt", "scroll-mb", "scroll-ms", "scroll-me"],
    ],
    shorthand: "scroll-m",
  },
  // Scroll margin patterns (2-way)
  {
    patterns: [["scroll-mx", "scroll-my"]],
    shorthand: "scroll-m",
  },
  {
    patterns: [["scroll-mt", "scroll-mb"]],
    shorthand: "scroll-my",
  },
  {
    patterns: [
      ["scroll-ml", "scroll-mr"],
      ["scroll-ms", "scroll-me"],
    ],
    shorthand: "scroll-mx",
  },
  // Scroll padding patterns (4-way, highest priority)
  {
    patterns: [
      ["scroll-pt", "scroll-pb", "scroll-pl", "scroll-pr"],
      ["scroll-pt", "scroll-pb", "scroll-ps", "scroll-pe"],
    ],
    shorthand: "scroll-p",
  },
  // Scroll padding patterns (2-way)
  {
    patterns: [["scroll-px", "scroll-py"]],
    shorthand: "scroll-p",
  },
  {
    patterns: [["scroll-pt", "scroll-pb"]],
    shorthand: "scroll-py",
  },
  {
    patterns: [
      ["scroll-pl", "scroll-pr"],
      ["scroll-ps", "scroll-pe"],
    ],
    shorthand: "scroll-px",
  },
]

const GAP_PATTERNS: ShorthandPattern[] = [
  {
    patterns: [["gap-x", "gap-y"]],
    shorthand: "gap",
  },
]

const GRID_FLEXBOX_PATTERNS: ShorthandPattern[] = [
  {
    patterns: [["justify-items", "align-items"]],
    shorthand: "place-items",
  },
  {
    patterns: [["justify-content", "align-content"]],
    shorthand: "place-content",
  },
  {
    patterns: [["justify-self", "align-self"]],
    shorthand: "place-self",
  },
]

const OVERFLOW_PATTERNS: ShorthandPattern[] = [
  {
    patterns: [["overflow-x", "overflow-y"]],
    shorthand: "overflow",
  },
]

const OVERSCROLL_PATTERNS: ShorthandPattern[] = [
  {
    patterns: [["overscroll-x", "overscroll-y"]],
    shorthand: "overscroll",
  },
]

const BORDER_SPACING_PATTERNS: ShorthandPattern[] = [
  {
    patterns: [["border-spacing-x", "border-spacing-y"]],
    shorthand: "border-spacing",
  },
]

const MISC_PATTERNS: ShorthandPattern[] = [
  {
    patterns: [["overflow-hidden", "text-ellipsis", "whitespace-nowrap"]],
    shorthand: "truncate",
  },
]

const PATTERN_SETS = {
  spacing: SPACING_PATTERNS,
  border: BORDER_PATTERNS,
  borderRadius: BORDER_RADIUS_PATTERNS,
  gridFlexbox: GRID_FLEXBOX_PATTERNS,
  layout: LAYOUT_PATTERNS,
  gap: GAP_PATTERNS,
  overflow: OVERFLOW_PATTERNS,
  overscroll: OVERSCROLL_PATTERNS,
  borderSpacing: BORDER_SPACING_PATTERNS,
  misc: MISC_PATTERNS,
}

// =============================================================================
// Main Functions
// =============================================================================

export function applyShorthands(value: string) {
  // Step 1: Parse - Parse input classes once
  const originalClasses = value.split(/\s+/).filter(Boolean)
  let classInfos = parseClasses(originalClasses)

  // Step 2: Transform - Apply transformations iteratively on ClassInfo[]
  const transformations: Array<{
    classnames: string
    shorthand: string
    position: number
  }> = []

  let hasChanges = true
  while (hasChanges) {
    const result = findShorthandTransformation(classInfos)
    if (result.applied && result.matchedClasses && result.shorthandClass) {
      // Find the position of the first matched class in the original value
      const firstMatchedClass = result.matchedClasses[0]
      const position = originalClasses.indexOf(firstMatchedClass)

      transformations.push({
        classnames: result.matchedClasses.join(", "),
        shorthand: result.shorthandClass,
        position: position,
      })

      // Update classInfos directly (no string conversion/parsing)
      classInfos = result.classInfos
    } else {
      hasChanges = false
    }
  }

  // Step 2.5: Remove redundant classes after transformations
  const redundancyResult = removeRedundantClasses(classInfos)
  if (redundancyResult.removedClasses.length > 0) {
    classInfos = redundancyResult.classInfos

    // Add redundancy removal as a transformation
    // Find the remaining class that covers the removed functionality
    const remainingClass = redundancyResult.classInfos.find((c) => {
      // Find a class that could represent the combined functionality
      const removedClassInfo = parseClasses(redundancyResult.removedClasses)[0]
      return (
        c.detail.prefix === removedClassInfo.detail.prefix &&
        c.detail.value === removedClassInfo.detail.value &&
        c.detail.isNegative === removedClassInfo.detail.isNegative
      )
    })

    if (remainingClass) {
      const allClasses = [
        ...redundancyResult.removedClasses,
        remainingClass.original,
      ]
      const position = Math.min(
        ...allClasses
          .map((cls) => originalClasses.indexOf(cls))
          .filter((i) => i !== -1),
      )

      transformations.push({
        classnames: allClasses.join(", "),
        shorthand: remainingClass.original,
        position: position,
      })
    }
  }

  // Step 3: Assemble - Convert to string only once at the end
  const finalValue = classInfos.map((cls) => cls.original).join(" ")

  // Compact transformations to merge multi-step changes
  const compactedTransformations = compactTransformations(
    transformations,
    originalClasses,
  )

  return {
    applied: transformations.length > 0,
    value: finalValue,
    transformations: compactedTransformations,
  }
}

// =============================================================================
// Core Transformation Functions
// =============================================================================

/**
 * Check if all important modifiers use the same style (leading vs trailing)
 */
function hasConsistentImportantStyle(classInfos: ClassInfo[]): boolean {
  const importantClasses = classInfos.filter((c) => c.detail.important !== null)
  if (importantClasses.length <= 1) return true

  // Check the style of the first important class
  const firstImportantStyle = importantClasses[0].detail.important

  // Check if all other important classes use the same style
  return importantClasses.every(
    (classInfo) => classInfo.detail.important === firstImportantStyle,
  )
}

function findMatchingClasses(
  patterns: string[][],
  classInfos: ClassInfo[],
): MatchResult | null {
  for (const pattern of patterns) {
    // Check if this is a misc pattern (contains complete class names that don't follow type-value pattern)
    const isMiscPattern =
      pattern.includes("overflow-hidden") ||
      pattern.includes("text-ellipsis") ||
      pattern.includes("whitespace-nowrap")

    if (isMiscPattern) {
      // Handle misc patterns that match full class names
      const classGroups = new Map<string, ClassInfo[]>()

      // Group classes by prefix combination
      for (const classInfo of classInfos) {
        // For misc patterns, we need to match the original class name without prefix and important
        // because parseGeneric splits "overflow-hidden" into type="overflow", value="hidden"
        const baseClass = classInfo.baseClass

        if (pattern.includes(baseClass)) {
          const key = `${classInfo.detail.prefix}|${classInfo.detail.isNegative}|${classInfo.detail.important ?? "null"}`
          if (!classGroups.has(key)) {
            classGroups.set(key, [])
          }
          const group = classGroups.get(key)
          if (group) {
            group.push(classInfo)
          }
        }
      }

      // Check each group to see if it contains all required types
      for (const [key, groupClasses] of classGroups) {
        const [prefix, isNegativeStr, importantStr] = key.split("|")
        const isNegative = isNegativeStr === "true"
        const important: "leading" | "trailing" | null =
          importantStr === "null"
            ? null
            : (importantStr as "leading" | "trailing")

        // Check if this group has all required types
        const foundTypes = new Set(groupClasses.map((c) => c.baseClass))
        const hasAllTypes = pattern.every((requiredType) =>
          foundTypes.has(requiredType),
        )

        if (hasAllTypes && groupClasses.length === pattern.length) {
          // Check for consistent important modifier style before creating match
          if (!hasConsistentImportantStyle(groupClasses)) {
            continue // Skip this group if important styles are inconsistent
          }

          // Found a complete match
          const matches: { [key: string]: string } = {}
          const matchedClassInfos: ClassInfo[] = []

          for (const requiredType of pattern) {
            const classInfo = groupClasses.find(
              (c) => c.baseClass === requiredType,
            )
            if (classInfo) {
              matches[requiredType] = classInfo.original
              matchedClassInfos.push(classInfo)
            }
          }

          // Sort matched classes by their original appearance order
          matchedClassInfos.sort((a, b) => {
            const aIndex = classInfos.findIndex(
              (cls) => cls.original === a.original,
            )
            const bIndex = classInfos.findIndex(
              (cls) => cls.original === b.original,
            )
            return aIndex - bIndex
          })

          const matchedClasses = matchedClassInfos.map((info) => info.original)

          return {
            matches,
            matchedClasses,
            commonPrefix: prefix,
            commonValue: "", // Misc patterns don't have values
            commonNegative: isNegative,
            commonImportant: important,
          }
        }
      }
    } else {
      // Handle regular patterns that match by type and value
      const classGroups = new Map<string, ClassInfo[]>()

      // Group classes by prefix-value combination
      for (const classInfo of classInfos) {
        if (pattern.includes(classInfo.detail.type)) {
          const key = `${classInfo.detail.prefix}|${classInfo.detail.value}|${classInfo.detail.isNegative}|${classInfo.detail.important ?? "null"}`
          if (!classGroups.has(key)) {
            classGroups.set(key, [])
          }
          const group = classGroups.get(key)
          if (group) {
            group.push(classInfo)
          }
        }
      }

      // Check each group to see if it contains all required types
      for (const [key, groupClasses] of classGroups) {
        const [prefix, value, isNegativeStr, importantStr] = key.split("|")
        const isNegative = isNegativeStr === "true"
        const important: "leading" | "trailing" | null =
          importantStr === "null"
            ? null
            : (importantStr as "leading" | "trailing")

        // Check if this group has all required types
        const foundTypes = new Set(groupClasses.map((c) => c.detail.type))
        const hasAllTypes = pattern.every((requiredType) =>
          foundTypes.has(requiredType),
        )

        if (hasAllTypes && groupClasses.length === pattern.length) {
          // Check for consistent important modifier style before creating match
          if (!hasConsistentImportantStyle(groupClasses)) {
            continue // Skip this group if important styles are inconsistent
          }

          // Found a complete match
          const matches: { [key: string]: string } = {}
          const matchedClassInfos: ClassInfo[] = []

          for (const requiredType of pattern) {
            const classInfo = groupClasses.find(
              (c) => c.detail.type === requiredType,
            )
            if (classInfo) {
              matches[requiredType] = classInfo.original
              matchedClassInfos.push(classInfo)
            }
          }

          // Sort matched classes by their original appearance order
          matchedClassInfos.sort((a, b) => {
            const aIndex = classInfos.findIndex(
              (cls) => cls.original === a.original,
            )
            const bIndex = classInfos.findIndex(
              (cls) => cls.original === b.original,
            )
            return aIndex - bIndex
          })

          const matchedClasses = matchedClassInfos.map((info) => info.original)

          return {
            matches,
            matchedClasses,
            commonPrefix: prefix,
            commonValue: value,
            commonNegative: isNegative,
            commonImportant: important,
          }
        }
      }
    }
  }
  return null
}

function findShorthandTransformation(
  classInfos: ClassInfo[],
): ParsedTransformResult {
  // Handle sizing first as it's more specific than spacing patterns
  const sizingResult = handleSizing(classInfos)
  if (sizingResult.applied) return sizingResult

  // Try each pattern set
  for (const [_name, patterns] of Object.entries(PATTERN_SETS)) {
    const result = applyPatternTransformation(patterns, classInfos)
    if (result.applied) return result
  }

  // Other special cases that need custom handling
  const transformResult = handleTransforms(classInfos)
  if (transformResult.applied) return transformResult

  return { applied: false, classInfos }
}

function applyPatternTransformation(
  patterns: ShorthandPattern[],
  classInfos: ClassInfo[],
): ParsedTransformResult {
  for (const { patterns: patternList, shorthand } of patterns) {
    const result = findMatchingClasses(patternList, classInfos)
    if (result) {
      const { matchedClasses } = result

      // Create shorthand class and ClassInfo
      const { shorthandClass, shorthandClassInfo } =
        createShorthandFromMatchResult(result, shorthand)

      return {
        applied: true,
        classInfos: applyTransformationToClassInfos(
          classInfos,
          matchedClasses,
          shorthandClassInfo,
        ),
        matchedClasses,
        shorthandClass,
      }
    }
  }
  return { applied: false, classInfos }
}

function handleSizing(classInfos: ClassInfo[]): ParsedTransformResult {
  const sizingResult = findMatchingClasses([["w", "h"]], classInfos)
  if (sizingResult) {
    const { matchedClasses } = sizingResult

    // Create shorthand class and ClassInfo
    const { shorthandClass, shorthandClassInfo } =
      createShorthandFromMatchResult(sizingResult, "size")

    return {
      applied: true,
      classInfos: applyTransformationToClassInfos(
        classInfos,
        matchedClasses,
        shorthandClassInfo,
      ),
      matchedClasses,
      shorthandClass,
    }
  }
  return { applied: false, classInfos }
}

function handleTransforms(classInfos: ClassInfo[]): ParsedTransformResult {
  const transformTypes = ["translate", "scale", "skew"]

  for (const transformType of transformTypes) {
    const result = findMatchingClasses(
      [[`${transformType}-x`, `${transformType}-y`]],
      classInfos,
    )
    if (result) {
      const { matchedClasses, commonValue } = result

      if (commonValue !== null) {
        // For transforms, we need to handle the prefix differently (no common prefix)
        const modifiedResult = { ...result, commonPrefix: "" }
        const { shorthandClass, shorthandClassInfo } =
          createShorthandFromMatchResult(modifiedResult, transformType)

        return {
          applied: true,
          classInfos: applyTransformationToClassInfos(
            classInfos,
            matchedClasses,
            shorthandClassInfo,
          ),
          matchedClasses,
          shorthandClass,
        }
      }
    }
  }
  return { applied: false, classInfos }
}

// =============================================================================
// Utility Functions
// =============================================================================

function createShorthandFromMatchResult(
  matchResult: MatchResult,
  shorthandType: string,
): { shorthandClass: string; shorthandClassInfo: ClassInfo } {
  const { commonPrefix, commonValue, commonNegative, commonImportant } =
    matchResult

  const shorthandClass = emitClassName({
    prefix: commonPrefix,
    type: shorthandType,
    value: commonValue,
    isNegative: commonNegative,
    important: commonImportant,
  })

  const baseClass = emitBaseClassName({
    prefix: commonPrefix,
    type: shorthandType,
    value: commonValue,
    isNegative: commonNegative,
    important: commonImportant,
  })

  // Directly construct ClassInfo without string parsing
  const shorthandClassInfo: ClassInfo = {
    original: shorthandClass,
    baseClass: baseClass,
    detail: {
      prefix: commonPrefix,
      type: shorthandType,
      value: commonValue,
      isNegative: commonNegative,
      important: commonImportant,
    },
  }

  return { shorthandClass, shorthandClassInfo }
}

function applyTransformationToClassInfos(
  classInfos: ClassInfo[],
  matchedClasses: string[],
  shorthandClassInfo: ClassInfo,
): ClassInfo[] {
  // Remove matched classes
  const remainingClasses = classInfos.filter(
    (cls) => !matchedClasses.includes(cls.original),
  )

  // Find insertion position
  const firstIndex = Math.min(
    ...matchedClasses.map((cls) =>
      classInfos.findIndex((pc) => pc.original === cls),
    ),
  )

  // Insert shorthand at the appropriate position
  return [
    ...remainingClasses.slice(0, firstIndex),
    shorthandClassInfo,
    ...remainingClasses.slice(firstIndex),
  ]
}

function compactTransformations(
  transformations: Array<{
    classnames: string
    shorthand: string
    position: number
  }>,
  originalClasses: string[],
): Array<{
  classnames: string
  shorthand: string
}> {
  if (transformations.length <= 1) {
    return transformations.map(({ classnames, shorthand }) => ({
      classnames,
      shorthand,
    }))
  }

  // Create a mapping from shorthand to the classes that produced it
  const shorthandToInputClasses = new Map<string, string[]>()

  for (const transformation of transformations) {
    const classes = transformation.classnames.split(", ")
    shorthandToInputClasses.set(transformation.shorthand, classes)
  }

  // Find which shorthands are used as inputs to other transformations
  const usedAsInput = new Set<string>()
  for (const transformation of transformations) {
    const classes = transformation.classnames.split(", ")
    for (const cls of classes) {
      if (shorthandToInputClasses.has(cls)) {
        usedAsInput.add(cls)
      }
    }
  }

  // Final transformations are those whose shorthand is not used as input
  const finalTransformations = transformations.filter(
    (transformation) => !usedAsInput.has(transformation.shorthand),
  )

  // Sort the final transformations by the position of their first original class
  const result = finalTransformations
    .map((transformation) => {
      const originalClassesFound: string[] = []
      const visited = new Set<string>()

      // Recursively collect original classes while preserving order
      function collectOriginalClasses(shorthandOrClass: string) {
        if (visited.has(shorthandOrClass)) {
          return
        }
        visited.add(shorthandOrClass)

        const inputClasses = shorthandToInputClasses.get(shorthandOrClass)
        if (inputClasses) {
          // This is a shorthand, so collect its input classes
          for (const cls of inputClasses) {
            collectOriginalClasses(cls)
          }
        } else {
          // This is an original class
          if (!originalClassesFound.includes(shorthandOrClass)) {
            originalClassesFound.push(shorthandOrClass)
          }
        }
      }

      collectOriginalClasses(transformation.shorthand)

      // Sort the found original classes by their appearance in the original input
      const orderedClasses = originalClassesFound.sort((a, b) => {
        const indexA = originalClasses.indexOf(a)
        const indexB = originalClasses.indexOf(b)
        return indexA - indexB
      })

      // Find the minimum index for ordering final transformations
      const minIndex = Math.min(
        ...orderedClasses.map((cls) => originalClasses.indexOf(cls)),
      )

      return {
        classnames: orderedClasses.join(", "),
        shorthand: transformation.shorthand,
        minIndex,
      }
    })
    .sort((a, b) => a.minIndex - b.minIndex)
    .map(({ classnames, shorthand }) => ({ classnames, shorthand }))

  return result
}

// =============================================================================
// Redundancy Detection and Removal
// =============================================================================

function removeRedundantClasses(classInfos: ClassInfo[]): {
  classInfos: ClassInfo[]
  removedClasses: string[]
} {
  const removedClasses: string[] = []
  let filteredClasses = [...classInfos]

  // Define redundancy rules
  const redundancyRules = [
    // If we have p-X, then px-X and py-X are redundant (and their components)
    {
      base: "p",
      redundant: ["px", "py", "pt", "pb", "pl", "pr", "ps", "pe"],
    },
    // If we have m-X, then mx-X and my-X are redundant (and their components)
    {
      base: "m",
      redundant: ["mx", "my", "mt", "mb", "ml", "mr", "ms", "me"],
    },
    // If we have px-X, then pl-X and pr-X are redundant
    {
      base: "px",
      redundant: ["pl", "pr", "ps", "pe"],
    },
    // If we have py-X, then pt-X and pb-X are redundant
    {
      base: "py",
      redundant: ["pt", "pb"],
    },
    // If we have mx-X, then ml-X and mr-X are redundant
    {
      base: "mx",
      redundant: ["ml", "mr", "ms", "me"],
    },
    // If we have my-X, then mt-X and mb-X are redundant
    {
      base: "my",
      redundant: ["mt", "mb"],
    },
    // Border patterns
    {
      base: "border",
      redundant: [
        "border-x",
        "border-y",
        "border-t",
        "border-b",
        "border-l",
        "border-r",
        "border-s",
        "border-e",
      ],
    },
    {
      base: "border-x",
      redundant: ["border-l", "border-r", "border-s", "border-e"],
    },
    {
      base: "border-y",
      redundant: ["border-t", "border-b"],
    },
    // Rounded patterns
    {
      base: "rounded",
      redundant: [
        "rounded-t",
        "rounded-b",
        "rounded-l",
        "rounded-r",
        "rounded-s",
        "rounded-e",
        "rounded-tl",
        "rounded-tr",
        "rounded-bl",
        "rounded-br",
        "rounded-ss",
        "rounded-se",
        "rounded-es",
        "rounded-ee",
      ],
    },
    {
      base: "rounded-t",
      redundant: ["rounded-tl", "rounded-tr", "rounded-ss", "rounded-se"],
    },
    {
      base: "rounded-b",
      redundant: ["rounded-bl", "rounded-br", "rounded-es", "rounded-ee"],
    },
    {
      base: "rounded-l",
      redundant: ["rounded-tl", "rounded-bl"],
    },
    {
      base: "rounded-r",
      redundant: ["rounded-tr", "rounded-br"],
    },
    {
      base: "rounded-s",
      redundant: ["rounded-ss", "rounded-es"],
    },
    {
      base: "rounded-e",
      redundant: ["rounded-se", "rounded-ee"],
    },
  ]

  for (const rule of redundancyRules) {
    // Group classes by prefix and value
    const classGroups = new Map<string, ClassInfo[]>()
    for (const classInfo of filteredClasses) {
      const key = `${classInfo.detail.prefix}|${classInfo.detail.value}|${classInfo.detail.isNegative}`
      if (!classGroups.has(key)) {
        classGroups.set(key, [])
      }
      const group = classGroups.get(key)
      if (group) {
        group.push(classInfo)
      }
    }

    for (const [_, groupClasses] of classGroups) {
      // Check if base class exists in this group
      const baseClass = groupClasses.find((c) => c.detail.type === rule.base)
      if (baseClass) {
        // Remove redundant classes from the same group
        const redundantClassesToRemove = groupClasses.filter(
          (c) => rule.redundant.includes(c.detail.type) && c !== baseClass,
        )

        for (const redundantClass of redundantClassesToRemove) {
          removedClasses.push(redundantClass.original)
          filteredClasses = filteredClasses.filter((c) => c !== redundantClass)
        }
      }
    }
  }

  return {
    classInfos: filteredClasses,
    removedClasses,
  }
}

// =============================================================================
