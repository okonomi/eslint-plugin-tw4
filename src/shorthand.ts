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

    // Handle border-spacing classes (border-spacing-x-, border-spacing-y-)
    if (cleanClass.startsWith("border-spacing-")) {
      const spacingPart = cleanClass.substring(15) // Remove "border-spacing-"

      // Check for directional border-spacing (border-spacing-x-, border-spacing-y-)
      const directionMatch = spacingPart.match(/^([xy])-(.+)$/)
      if (directionMatch) {
        return {
          type: `border-spacing-${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "misc",
        }
      }

      // Non-directional border-spacing
      return {
        type: "border-spacing",
        value: spacingPart,
        isNegative,
        category: "misc",
      }
    }

    // Handle border classes (border-t-1, border-t-red-500, etc.)
    if (cleanClass.startsWith("border-")) {
      const borderPart = cleanClass.substring(7) // Remove "border-"

      // Check for directional border (border-t-, border-l-, etc.)
      const directionMatch = borderPart.match(/^([tlbr]|[xy]|s|e)-(.+)$/)
      if (directionMatch) {
        return {
          type: `border-${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "border-width-color",
        }
      }

      // Non-directional border (border-1, border-red-500, etc.)
      return {
        type: "border",
        value: borderPart,
        isNegative,
        category: "border-width-color",
      }
    }

    // Handle rounded classes
    if (cleanClass.startsWith("rounded-")) {
      const roundedPart = cleanClass.substring(8) // Remove "rounded-"

      // Check for corner-specific rounded (rounded-tl-, rounded-tr-, etc.)
      const cornerMatch = roundedPart.match(/^(tl|tr|bl|br|ss|se|es|ee)-(.+)$/)
      if (cornerMatch) {
        return {
          type: `rounded-${cornerMatch[1]}`,
          value: cornerMatch[2],
          isNegative,
          category: "border-radius",
        }
      }

      // Check for side-specific rounded (rounded-t-, rounded-l-, etc.)
      const sideMatch = roundedPart.match(/^([tlbr]|s|e)-(.+)$/)
      if (sideMatch) {
        return {
          type: `rounded-${sideMatch[1]}`,
          value: sideMatch[2],
          isNegative,
          category: "border-radius",
        }
      }

      // Non-directional rounded (rounded-md, rounded-lg, etc.)
      return {
        type: "rounded",
        value: roundedPart,
        isNegative,
        category: "border-radius",
      }
    }

    // Handle inset classes
    if (cleanClass.startsWith("inset-")) {
      const insetPart = cleanClass.substring(6) // Remove "inset-"

      // Check for directional inset (inset-x-, inset-y-)
      const directionMatch = insetPart.match(/^([xy])-(.+)$/)
      if (directionMatch) {
        return {
          type: `inset-${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "layout-inset",
        }
      }

      // Non-directional inset
      return {
        type: "inset",
        value: insetPart,
        isNegative,
        category: "layout-inset",
      }
    }

    // Handle position classes (top, bottom, left, right, start, end)
    if (
      ["top", "bottom", "left", "right", "start", "end"].includes(
        cleanClass.split("-")[0],
      )
    ) {
      const dashIndex = cleanClass.indexOf("-")
      if (dashIndex !== -1) {
        const type = cleanClass.substring(0, dashIndex)
        const classValue = cleanClass.substring(dashIndex + 1)
        return {
          type,
          value: classValue,
          isNegative,
          category: "layout-inset",
        }
      }
    }

    // Handle scroll margin classes
    if (cleanClass.startsWith("scroll-m")) {
      const scrollPart = cleanClass.substring(8) // Remove "scroll-m"

      // Check for directional scroll margin (scroll-mt-, scroll-mx-, etc.)
      const directionMatch = scrollPart.match(/^(t|b|l|r|x|y|s|e)-(.+)$/)
      if (directionMatch) {
        return {
          type: `scroll-m${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "layout-scroll",
        }
      }

      // Non-directional scroll margin (scroll-m-)
      const nonDirectionalMatch = scrollPart.match(/^-(.+)$/)
      if (nonDirectionalMatch) {
        return {
          type: "scroll-m",
          value: nonDirectionalMatch[1],
          isNegative,
          category: "layout-scroll",
        }
      }
    }

    // Handle scroll padding classes
    if (cleanClass.startsWith("scroll-p")) {
      const scrollPart = cleanClass.substring(8) // Remove "scroll-p"

      // Check for directional scroll padding (scroll-pt-, scroll-px-, etc.)
      const directionMatch = scrollPart.match(/^(t|b|l|r|x|y|s|e)-(.+)$/)
      if (directionMatch) {
        return {
          type: `scroll-p${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "layout-scroll",
        }
      }

      // Non-directional scroll padding (scroll-p-)
      const nonDirectionalMatch = scrollPart.match(/^-(.+)$/)
      if (nonDirectionalMatch) {
        return {
          type: "scroll-p",
          value: nonDirectionalMatch[1],
          isNegative,
          category: "layout-scroll",
        }
      }
    }

    // Handle gap classes
    if (cleanClass.startsWith("gap-")) {
      const gapPart = cleanClass.substring(4) // Remove "gap-"

      // Check for directional gap (gap-x-, gap-y-)
      const directionMatch = gapPart.match(/^([xy])-(.+)$/)
      if (directionMatch) {
        return {
          type: `gap-${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "layout-gap",
        }
      }

      // Non-directional gap (gap-)
      return {
        type: "gap",
        value: gapPart,
        isNegative,
        category: "layout-gap",
      }
    }

    // Handle grid & flexbox classes (justify-*, align-*)
    if (cleanClass.startsWith("justify-") || cleanClass.startsWith("align-")) {
      const isJustify = cleanClass.startsWith("justify-")
      const prefix = isJustify ? "justify-" : "align-"
      const rest = cleanClass.substring(prefix.length)

      // Parse grid/flexbox property types: items, content, self
      const typeMatch = rest.match(/^(items|content|self)-(.+)$/)
      if (typeMatch) {
        const propertyType = typeMatch[1] // items, content, self
        const propertyValue = typeMatch[2] // center, start, end, etc.

        return {
          type: `${prefix}${propertyType}`,
          value: propertyValue,
          isNegative,
          category: "grid-flexbox",
        }
      }
    }

    // Handle transform classes (translate, scale, skew)
    if (
      cleanClass.startsWith("translate-") ||
      cleanClass.startsWith("scale-") ||
      cleanClass.startsWith("skew-")
    ) {
      const transformMatch = cleanClass.match(
        /^(translate|scale|skew)-([xy])-(.+)$/,
      )
      if (transformMatch) {
        const transformType = transformMatch[1] // translate, scale, skew
        const direction = transformMatch[2] // x, y
        const value = transformMatch[3] // 4, 110, 12, etc.

        return {
          type: `${transformType}-${direction}`,
          value: value,
          isNegative,
          category: "transform",
        }
      }
    }

    // Handle overflow classes (overflow-x-, overflow-y-)
    if (cleanClass.startsWith("overflow-")) {
      const overflowPart = cleanClass.substring(9) // Remove "overflow-"

      // Check for directional overflow (overflow-x-, overflow-y-)
      const directionMatch = overflowPart.match(/^([xy])-(.+)$/)
      if (directionMatch) {
        return {
          type: `overflow-${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "misc",
        }
      }

      // Non-directional overflow
      return {
        type: "overflow",
        value: overflowPart,
        isNegative,
        category: "misc",
      }
    }

    // Handle overscroll classes (overscroll-x-, overscroll-y-)
    if (cleanClass.startsWith("overscroll-")) {
      const overscrollPart = cleanClass.substring(11) // Remove "overscroll-"

      // Check for directional overscroll (overscroll-x-, overscroll-y-)
      const directionMatch = overscrollPart.match(/^([xy])-(.+)$/)
      if (directionMatch) {
        return {
          type: `overscroll-${directionMatch[1]}`,
          value: directionMatch[2],
          isNegative,
          category: "misc",
        }
      }

      // Non-directional overscroll
      return {
        type: "overscroll",
        value: overscrollPart,
        isNegative,
        category: "misc",
      }
    }

    // Original logic for other classes
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

  // Define border patterns
  const borderPatterns = [
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

  // Define border radius patterns
  const borderRadiusPatterns = [
    // 4-corner to full
    {
      patterns: [
        ["rounded-tl", "rounded-tr", "rounded-bl", "rounded-br"],
        ["rounded-ss", "rounded-se", "rounded-es", "rounded-ee"],
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

  // Define layout patterns
  const layoutPatterns = [
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

  // Define gap patterns
  const gapPatterns = [
    // Gap patterns (2-way)
    {
      patterns: [["gap-x", "gap-y"]],
      shorthand: "gap",
    },
  ]

  // Define grid & flexbox patterns
  const gridFlexboxPatterns = [
    // Place items patterns (justify-items + align-items → place-items)
    {
      patterns: [["justify-items", "align-items"]],
      shorthand: "place-items",
    },
    // Place content patterns (justify-content + align-content → place-content)
    {
      patterns: [["justify-content", "align-content"]],
      shorthand: "place-content",
    },
    // Place self patterns (justify-self + align-self → place-self)
    {
      patterns: [["justify-self", "align-self"]],
      shorthand: "place-self",
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

  // Check border patterns
  for (const { patterns, shorthand } of borderPatterns) {
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

  // Check border radius patterns
  for (const { patterns, shorthand } of borderRadiusPatterns) {
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

  // Check grid & flexbox patterns
  for (const { patterns, shorthand } of gridFlexboxPatterns) {
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

  // Check layout patterns
  for (const { patterns, shorthand } of layoutPatterns) {
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

  // Check gap patterns
  for (const { patterns, shorthand } of gapPatterns) {
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

  // Check grid & flexbox patterns
  for (const { patterns, shorthand } of gridFlexboxPatterns) {
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

  // Transform shortcuts (translate, scale, skew)
  const transformTypes = ["translate", "scale", "skew"]
  for (const transformType of transformTypes) {
    const result = findMatchingClasses([
      [`${transformType}-x`, `${transformType}-y`],
    ])
    if (result) {
      const { matchedClasses, commonPrefix, commonValue, commonNegative } =
        result

      // Helper to convert transform values
      function convertTransformValue(type: string, value: string): string {
        switch (type) {
          case "translate":
            // Convert spacing values to rem/px
            if (value === "0") return "0"
            if (value === "px") return "1px"
            if (value === "full") return "100%"
            if (value.includes("/")) {
              const [num, denom] = value.split("/")
              return `${(Number.parseFloat(num) / Number.parseFloat(denom)) * 100}%`
            }
            return `${Number.parseFloat(value) * 0.25}rem`
          case "scale":
            // Convert scale values (100 = 1, 110 = 1.1, etc.)
            return (Number.parseFloat(value) / 100).toString()
          case "skew":
            // Skew values remain as degrees
            return `${value}deg`
          default:
            return value
        }
      }

      // Get individual x and y values
      const xClass = matchedClasses.find(
        (cls) =>
          parseBaseClass(parseClass(cls).baseClass)?.type ===
          `${transformType}-x`,
      )
      const yClass = matchedClasses.find(
        (cls) =>
          parseBaseClass(parseClass(cls).baseClass)?.type ===
          `${transformType}-y`,
      )

      if (xClass && yClass) {
        const xParsed = parseBaseClass(parseClass(xClass).baseClass)
        const yParsed = parseBaseClass(parseClass(yClass).baseClass)

        if (xParsed && yParsed) {
          const xValue = convertTransformValue(transformType, xParsed.value)
          const yValue = convertTransformValue(transformType, yParsed.value)

          let shorthandClass: string

          if (
            xParsed.value === yParsed.value &&
            xParsed.isNegative === yParsed.isNegative
          ) {
            // Same values: use simple shorthand
            const negativePrefix = commonNegative ? "-" : ""
            shorthandClass = `${negativePrefix}${transformType}-${commonValue}`
          } else {
            // Different values: use custom property
            const xNegativePrefix = xParsed.isNegative ? "-" : ""
            const yNegativePrefix = yParsed.isNegative ? "-" : ""
            shorthandClass = `${transformType}-[${xNegativePrefix}${xValue}_${yNegativePrefix}${yValue}]`
          }

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
    }
  }

  // Check overflow patterns
  const overflowPatterns = [
    {
      patterns: [["overflow-x", "overflow-y"]],
      shorthand: "overflow",
    },
  ]

  for (const { patterns, shorthand } of overflowPatterns) {
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

  // Check overscroll patterns
  const overscrollPatterns = [
    {
      patterns: [["overscroll-x", "overscroll-y"]],
      shorthand: "overscroll",
    },
  ]

  for (const { patterns, shorthand } of overscrollPatterns) {
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

  // Check border-spacing patterns
  const borderSpacingPatterns = [
    {
      patterns: [["border-spacing-x", "border-spacing-y"]],
      shorthand: "border-spacing",
    },
  ]

  for (const { patterns, shorthand } of borderSpacingPatterns) {
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

  // Check misc patterns (like truncate)
  const miscPatterns = [
    {
      patterns: [["overflow-hidden", "text-ellipsis", "whitespace-nowrap"]],
      shorthand: "truncate",
    },
  ]

  for (const { patterns, shorthand } of miscPatterns) {
    let matches: { [key: string]: string } = {}
    let matchedClasses: string[] = []
    let commonPrefix = ""

    for (const pattern of patterns) {
      const currentMatches: { [key: string]: string } = {}
      const currentMatchedClasses: string[] = []
      let currentCommonPrefix = ""

      for (const expectedType of pattern) {
        let found = false

        for (const className of classes) {
          const parsed = parseClass(className)

          // Check for exact match with expected type
          if (parsed.baseClass === expectedType) {
            if (!currentCommonPrefix) {
              currentCommonPrefix = parsed.prefix
            } else if (currentCommonPrefix !== parsed.prefix) {
              found = false
              break
            }

            currentMatches[expectedType] = ""
            currentMatchedClasses.push(className)
            found = true
            break
          }
        }

        if (!found) {
          break
        }
      }

      // If all expected classes in this pattern were found
      if (Object.keys(currentMatches).length === pattern.length) {
        matches = currentMatches
        matchedClasses = currentMatchedClasses
        commonPrefix = currentCommonPrefix
        break
      }
    }

    if (matchedClasses.length > 0) {
      // Create shorthand class
      const shorthandClass = `${commonPrefix}${shorthand}`

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

  return {
    applied: false,
    value,
  }
}
