export function applyShorthand(value: string) {
  const classes = value.split(/\s+/).filter(Boolean)

  // Helper function to extract prefix and value from a class
  function parseClass(className: string) {
    const colonIndex = className.lastIndexOf(":")
    if (colonIndex !== -1) {
      const prefix = className.substring(0, colonIndex + 1)
      const baseClass = className.substring(colonIndex + 1)
      return { prefix, baseClass }
    }
    return { prefix: "", baseClass: className }
  }

  // Helper function to extract type and value from base class
  function parseBaseClass(baseClass: string) {
    // Handle negative values
    const isNegative = baseClass.startsWith("-")
    const cleanClass = isNegative ? baseClass.substring(1) : baseClass

    // Extract type and value (e.g., "w-1" -> type: "w", value: "1")
    const dashIndex = cleanClass.indexOf("-")
    if (dashIndex === -1) return null

    const type = cleanClass.substring(0, dashIndex)
    const classValue = cleanClass.substring(dashIndex + 1)

    return { type, value: classValue, isNegative }
  }

  // Helper function to find matching classes
  function findMatchingClasses(patterns: string[][]) {
    for (const pattern of patterns) {
      const matches: { [key: string]: string } = {}
      const matchedClasses: string[] = []
      let commonPrefix = ""
      let commonValue = ""
      let commonNegative = false
      let isValid = true

      // Check if all required classes exist with same prefix, value, and negative status
      for (const requiredType of pattern) {
        let found = false
        for (const className of classes) {
          const parsed = parseClass(className)
          const baseParsed = parseBaseClass(parsed.baseClass)

          if (baseParsed && baseParsed.type === requiredType) {
            if (matchedClasses.length === 0) {
              // First match - set common values
              commonPrefix = parsed.prefix
              commonValue = baseParsed.value
              commonNegative = baseParsed.isNegative
            } else {
              // Subsequent matches - must have same prefix, value, and negative status
              if (
                parsed.prefix !== commonPrefix ||
                baseParsed.value !== commonValue ||
                baseParsed.isNegative !== commonNegative
              ) {
                isValid = false
                break
              }
            }
            matches[requiredType] = className
            matchedClasses.push(className)
            found = true
            break
          }
        }
        if (!found) {
          isValid = false
          break
        }
      }

      if (isValid && matchedClasses.length === pattern.length) {
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

  // Define shorthand patterns with priority (more specific first)
  const spacingPatterns = [
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

  // Check spacing patterns
  for (const { patterns, shorthand } of spacingPatterns) {
    const result = findMatchingClasses(patterns)
    if (result) {
      const { matchedClasses, commonPrefix, commonValue, commonNegative } =
        result

      // Create shorthand class
      const negativePrefix = commonNegative ? "-" : ""
      const shorthandClass = `${commonPrefix}${negativePrefix}${shorthand}-${commonValue}`

      // Remove matched classes and add shorthand
      const filteredClasses = classes.filter(
        (cls) => !matchedClasses.includes(cls),
      )
      const firstIndex = Math.min(
        ...matchedClasses.map((cls) => classes.indexOf(cls)),
      )
      filteredClasses.splice(firstIndex, 0, shorthandClass)

      return {
        applied: true,
        value: filteredClasses.join(" "),
        classnames: matchedClasses.join(" "),
        shorthand: shorthandClass,
      }
    }
  }

  // Check sizing patterns (w-1 h-1 -> size-1)
  const sizingResult = findMatchingClasses([["w", "h"]])
  if (sizingResult) {
    const { matchedClasses, commonPrefix, commonValue, commonNegative } =
      sizingResult

    // Create shorthand class
    const negativePrefix = commonNegative ? "-" : ""
    const shorthandClass = `${commonPrefix}${negativePrefix}size-${commonValue}`

    // Remove matched classes and add shorthand
    const filteredClasses = classes.filter(
      (cls) => !matchedClasses.includes(cls),
    )
    const firstIndex = Math.min(
      ...matchedClasses.map((cls) => classes.indexOf(cls)),
    )
    filteredClasses.splice(firstIndex, 0, shorthandClass)

    return {
      applied: true,
      value: filteredClasses.join(" "),
      classnames: matchedClasses.join(" "),
      shorthand: shorthandClass,
    }
  }

  return {
    applied: false,
    value,
  }
}
