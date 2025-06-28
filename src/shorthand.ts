// =============================================================================
// Shorthand Functions - Using Improved ClassInfo Structure
// =============================================================================

import { type ClassInfo, parseClasses } from "./tw-shorthand/parsing"

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
}

type TransformResult = {
  applied: boolean
  value: string
  classnames?: string
  shorthand?: string
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

export function applyShorthand(inputValue: string): TransformResult {
  const classes = inputValue.split(/\s+/).filter(Boolean)
  const classInfos = parseClasses(classes)

  // Use the transformation function
  const transformResult = findShorthandTransformation(classInfos)

  if (
    transformResult.applied &&
    transformResult.matchedClasses &&
    transformResult.shorthandClass
  ) {
    // Assemble the final classes
    const finalClasses = transformResult.classInfos.map((c) => c.original)
    return {
      applied: true,
      value: finalClasses.join(" "),
      classnames: transformResult.matchedClasses.join(", "),
      shorthand: transformResult.shorthandClass,
    }
  }

  const originalValue = classInfos.map((cls) => cls.original).join(" ")
  return { applied: false, value: originalValue }
}

// =============================================================================
// Core Transformation Functions
// =============================================================================

function findMatchingClasses(
  patterns: string[][],
  classInfos: ClassInfo[],
): MatchResult | null {
  for (const pattern of patterns) {
    const matches: { [key: string]: string } = {}
    const matchedClassInfos: ClassInfo[] = []
    let commonPrefix = ""
    let commonValue = ""
    let commonNegative = false
    let isValid = true

    // Check if all required classes exist with same prefix, value, and negative status
    for (const requiredType of pattern) {
      let found = false
      for (const classInfo of classInfos) {
        // Simple, direct access - no null checks needed!
        if (classInfo.type === requiredType) {
          if (matchedClassInfos.length === 0) {
            // First match - set common values
            commonPrefix = classInfo.prefix
            commonValue = classInfo.value
            commonNegative = classInfo.isNegative
          } else {
            // Subsequent matches - must have same prefix, value, and negative status
            // Treat empty string as default value (same as any other empty string)
            const normalizedCommonValue = commonValue === "" ? "" : commonValue
            const normalizedCurrentValue =
              classInfo.value === "" ? "" : classInfo.value

            if (
              classInfo.prefix !== commonPrefix ||
              normalizedCurrentValue !== normalizedCommonValue ||
              classInfo.isNegative !== commonNegative
            ) {
              isValid = false
              break
            }
          }
          matches[requiredType] = classInfo.original
          matchedClassInfos.push(classInfo)
          found = true
          break
        }
      }
      if (!found) {
        isValid = false
        break
      }
    }

    if (isValid && matchedClassInfos.length === pattern.length) {
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
        commonPrefix,
        commonValue,
        commonNegative,
      }
    }
  }
  return null
}

function findShorthandTransformation(
  classInfos: ClassInfo[],
): ParsedTransformResult {
  // Try each pattern set
  for (const [_name, patterns] of Object.entries(PATTERN_SETS)) {
    const result = applyPatternTransformation(patterns, classInfos)
    if (result.applied) return result
  }

  // Special cases that need custom handling
  const specialResults = [
    handleSizing(classInfos),
    handleTransforms(classInfos),
    handlePlaceContentPatterns(classInfos),
    handleMiscPatterns(classInfos),
  ]

  for (const result of specialResults) {
    if (result.applied) return result
  }

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

function handleMiscPatterns(classInfos: ClassInfo[]): ParsedTransformResult {
  const miscPatterns = [
    {
      patterns: [["overflow-hidden", "text-ellipsis", "whitespace-nowrap"]],
      shorthand: "truncate",
    },
  ]

  for (const { patterns, shorthand } of miscPatterns) {
    let matchedClasses: string[] = []
    let commonPrefix = ""

    for (const pattern of patterns) {
      const currentMatches: { [key: string]: string } = {}
      const currentMatchedClasses: string[] = []
      let currentCommonPrefix = ""
      let patternValid = true

      for (const expectedType of pattern) {
        let found = false

        for (const classInfo of classInfos) {
          // Check if this classInfo matches the expected type
          // For misc patterns, we need to match the full original class name
          if (classInfo.original === expectedType) {
            if (currentMatches[expectedType] === undefined) {
              if (Object.keys(currentMatches).length === 0) {
                currentCommonPrefix = classInfo.prefix
              } else if (currentCommonPrefix !== classInfo.prefix) {
                patternValid = false
                break
              }

              currentMatches[expectedType] = ""
              currentMatchedClasses.push(classInfo.original)
              found = true
              break
            }
          }
        }

        if (!found || !patternValid) {
          patternValid = false
          break
        }
      }

      if (
        patternValid &&
        Object.keys(currentMatches).length === pattern.length
      ) {
        matchedClasses = currentMatchedClasses
        commonPrefix = currentCommonPrefix
        break
      }
    }

    if (matchedClasses.length > 0) {
      const shorthandClass = buildShorthandClassName(commonPrefix, shorthand)

      // Directly construct ClassInfo without string parsing
      const shorthandClassInfo: ClassInfo = {
        original: shorthandClass,
        prefix: commonPrefix,
        type: shorthand,
        value: "",
        isNegative: false,
      }

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

function handlePlaceContentPatterns(
  classInfos: ClassInfo[],
): ParsedTransformResult {
  // Define patterns for place-* shortcuts
  const placePatterns = [
    {
      alignType: "content",
      justifyType: "justify",
      shorthand: "place-content",
    },
    {
      alignType: "items",
      justifyType: "justify-items",
      shorthand: "place-items",
    },
    {
      alignType: "self",
      justifyType: "justify-self",
      shorthand: "place-self",
    },
  ]

  for (const pattern of placePatterns) {
    // Look for matching align and justify classes with the same value
    const alignClass = classInfos.find(
      (classInfo) => classInfo.type === pattern.alignType && classInfo.value,
    )
    const justifyClass = classInfos.find(
      (classInfo) => classInfo.type === pattern.justifyType && classInfo.value,
    )

    if (
      alignClass &&
      justifyClass &&
      alignClass.value === justifyClass.value &&
      alignClass.prefix === justifyClass.prefix &&
      alignClass.isNegative === justifyClass.isNegative
    ) {
      const { prefix, value, isNegative } = alignClass
      const matchedClasses = [alignClass.original, justifyClass.original]

      const shorthandClass = buildShorthandClassName(
        prefix,
        pattern.shorthand,
        value,
        isNegative,
      )

      // Directly construct ClassInfo without string parsing
      const shorthandClassInfo: ClassInfo = {
        original: shorthandClass,
        prefix,
        type: pattern.shorthand,
        value,
        isNegative,
      }

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

// =============================================================================
// Utility Functions
// =============================================================================

function createShorthandFromMatchResult(
  matchResult: MatchResult,
  shorthandType: string,
): { shorthandClass: string; shorthandClassInfo: ClassInfo } {
  const { commonPrefix, commonValue, commonNegative } = matchResult

  // Create shorthand class name using the common function
  const shorthandClass = buildShorthandClassName(
    commonPrefix,
    shorthandType,
    commonValue,
    commonNegative,
  )

  // Directly construct ClassInfo without string parsing
  const shorthandClassInfo: ClassInfo = {
    original: shorthandClass,
    prefix: commonPrefix,
    type: shorthandType,
    value: commonValue,
    isNegative: commonNegative,
  }

  return { shorthandClass, shorthandClassInfo }
}

function buildShorthandClassName(
  prefix: string,
  shorthandType: string,
  value = "",
  isNegative = false,
): string {
  const negativePrefix = isNegative ? "-" : ""
  const valuePart = value === "" ? "" : `-${value}`
  return `${prefix}${negativePrefix}${shorthandType}${valuePart}`
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
