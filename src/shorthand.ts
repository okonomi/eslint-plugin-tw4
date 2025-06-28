import { type ParsedClassInfo, parseClasses } from "./tw-shorthand/parsing"

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

export function applyShorthands(value: string) {
  // Step 1: Parse - Parse input classes once
  const originalClasses = value.split(/\s+/).filter(Boolean)
  let parsedClasses = parseClasses(originalClasses)

  // Step 2: Transform - Apply transformations iteratively
  const transformations: Array<{
    classnames: string
    shorthand: string
    position: number
  }> = []

  let hasChanges = true
  while (hasChanges) {
    const result = findShorthandTransformation(parsedClasses)
    if (result.applied && result.classnames && result.shorthand) {
      // Find the position of the first matched class in the original value
      const matchedClasses = result.classnames.split(", ")
      const firstMatchedClass = matchedClasses[0]
      const position = originalClasses.indexOf(firstMatchedClass)

      transformations.push({
        classnames: result.classnames,
        shorthand: result.shorthand,
        position: position,
      })

      // Update parsedClasses for next iteration
      const newClasses = result.value.split(/\s+/).filter(Boolean)
      parsedClasses = parseClasses(newClasses)
    } else {
      hasChanges = false
    }
  }

  // Step 3: Assemble - Sort transformations and build final result
  transformations.sort((a, b) => a.position - b.position)
  const finalValue = parsedClasses.map((cls) => cls.original).join(" ")

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

export function applyShorthand(value: string): TransformResult {
  const classes = value.split(/\s+/).filter(Boolean)
  const parsedClasses = parseClasses(classes)
  return findShorthandTransformation(parsedClasses)
}

function findShorthandTransformation(
  parsedClasses: ParsedClassInfo[],
): TransformResult {
  // Try each pattern set
  for (const [_name, patterns] of Object.entries(PATTERN_SETS)) {
    const result = applyPatternTransformation(patterns, parsedClasses)
    if (result) return result
  }

  // Special cases that need custom handling
  const specialResults = [
    handleSizing(parsedClasses),
    handleTransforms(parsedClasses),
    handleMiscPatterns(parsedClasses),
  ]

  for (const result of specialResults) {
    if (result?.applied) return result
  }

  const value = parsedClasses.map((cls) => cls.original).join(" ")
  return { applied: false, value }
}

function applyPatternTransformation(
  patterns: ShorthandPattern[],
  parsedClasses: ParsedClassInfo[],
): TransformResult | null {
  for (const { patterns: patternList, shorthand } of patterns) {
    const result = findMatchingClasses(patternList, parsedClasses)
    if (result) {
      const { matchedClasses, commonPrefix, commonValue, commonNegative } =
        result

      // Create shorthand class
      const negativePrefix = commonNegative ? "-" : ""
      const valuePart = commonValue === "" ? "" : `-${commonValue}`
      const shorthandClass = `${commonPrefix}${negativePrefix}${shorthand}${valuePart}`

      return createTransformResult(
        parsedClasses,
        matchedClasses,
        shorthandClass,
      )
    }
  }
  return null
}

// =============================================================================
// Special Case Handlers
// =============================================================================

function handleSizing(
  parsedClasses: ParsedClassInfo[],
): TransformResult | null {
  const sizingResult = findMatchingClasses([["w", "h"]], parsedClasses)
  if (sizingResult) {
    const { matchedClasses, commonPrefix, commonValue, commonNegative } =
      sizingResult

    const negativePrefix = commonNegative ? "-" : ""
    const valuePart = commonValue === "" ? "" : `-${commonValue}`
    const shorthandClass = `${commonPrefix}${negativePrefix}size${valuePart}`

    return createTransformResult(parsedClasses, matchedClasses, shorthandClass)
  }
  return null
}

function handleTransforms(
  parsedClasses: ParsedClassInfo[],
): TransformResult | null {
  const transformTypes = ["translate", "scale", "skew"]

  for (const transformType of transformTypes) {
    const result = findMatchingClasses(
      [[`${transformType}-x`, `${transformType}-y`]],
      parsedClasses,
    )
    if (result) {
      const { matchedClasses, commonValue, commonNegative } = result

      // For transform handling, we need to check the actual values
      // Since we can't access parseBaseClass here, we'll do a simpler approach
      if (commonValue !== null) {
        // Same values: use simple shorthand
        const negativePrefix = commonNegative ? "-" : ""
        const valuePart = commonValue === "" ? "" : `-${commonValue}`
        const shorthandClass = `${negativePrefix}${transformType}${valuePart}`

        return createTransformResult(
          parsedClasses,
          matchedClasses,
          shorthandClass,
        )
      }
    }
  }
  return null
}

function handleMiscPatterns(
  parsedClasses: ParsedClassInfo[],
): TransformResult | null {
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

        for (const classInfo of parsedClasses) {
          const { original, parsed } = classInfo

          // Check for exact match with expected type
          if (parsed.baseClass === expectedType) {
            if (currentMatches[expectedType] === undefined) {
              // First time we see this class
              if (Object.keys(currentMatches).length === 0) {
                // This is the first class we're matching
                currentCommonPrefix = parsed.prefix
              } else if (currentCommonPrefix !== parsed.prefix) {
                // Different prefixes found, this pattern doesn't match
                patternValid = false
                break
              }

              currentMatches[expectedType] = ""
              currentMatchedClasses.push(original)
              found = true
              break
            }
          }
        }

        if (!found || !patternValid) {
          // Reset everything if any class is not found or has different prefix
          patternValid = false
          break
        }
      }

      // If all expected classes in this pattern were found and prefixes match
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
      // Create shorthand class
      const shorthandClass = `${commonPrefix}${shorthand}`

      return createTransformResult(
        parsedClasses,
        matchedClasses,
        shorthandClass,
      )
    }
  }
  return null
}

// =============================================================================
// Utility Functions
// =============================================================================

function findMatchingClasses(
  patterns: string[][],
  parsedClasses: ParsedClassInfo[],
): MatchResult | null {
  for (const pattern of patterns) {
    const matches: { [key: string]: string } = {}
    const matchedClassInfos: ParsedClassInfo[] = []
    let commonPrefix = ""
    let commonValue = ""
    let commonNegative = false
    let isValid = true

    // Check if all required classes exist with same prefix, value, and negative status
    for (const requiredType of pattern) {
      let found = false
      for (const classInfo of parsedClasses) {
        const { original, parsed, baseParsed } = classInfo

        if (baseParsed && baseParsed.type === requiredType) {
          if (matchedClassInfos.length === 0) {
            // First match - set common values
            commonPrefix = parsed.prefix
            commonValue = baseParsed.value
            commonNegative = baseParsed.isNegative
          } else {
            // Subsequent matches - must have same prefix, value, and negative status
            // Treat empty string as default value (same as any other empty string)
            const normalizedCommonValue = commonValue === "" ? "" : commonValue
            const normalizedCurrentValue =
              baseParsed.value === "" ? "" : baseParsed.value

            if (
              parsed.prefix !== commonPrefix ||
              normalizedCurrentValue !== normalizedCommonValue ||
              baseParsed.isNegative !== commonNegative
            ) {
              isValid = false
              break
            }
          }
          matches[requiredType] = original
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
        const aIndex = parsedClasses.findIndex(
          (cls) => cls.original === a.original,
        )
        const bIndex = parsedClasses.findIndex(
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

function createTransformResult(
  parsedClasses: ParsedClassInfo[],
  matchedClasses: string[],
  shorthandClass: string,
): TransformResult {
  // Remove matched classes and add shorthand
  const remainingClasses = parsedClasses.filter(
    (cls) => !matchedClasses.includes(cls.original),
  )
  const firstIndex = Math.min(
    ...matchedClasses.map((cls) =>
      parsedClasses.findIndex((pc) => pc.original === cls),
    ),
  )
  const finalClasses = [
    ...remainingClasses.slice(0, firstIndex).map((c) => c.original),
    shorthandClass,
    ...remainingClasses.slice(firstIndex).map((c) => c.original),
  ]

  return {
    applied: true,
    value: finalClasses.join(" "),
    classnames: matchedClasses.join(", "),
    shorthand: shorthandClass,
  }
}

// =============================================================================
// Transformation Compaction
// =============================================================================

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

  // For each final transformation, trace back to find all original classes
  const result = finalTransformations.map((transformation) => {
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

    return {
      classnames: orderedClasses.join(", "),
      shorthand: transformation.shorthand,
    }
  })

  return result
}
