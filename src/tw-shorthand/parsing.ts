// =============================================================================
// Improved Parser - Flattened Structure
// =============================================================================

/**
 * Improved class info structure - flattened and type-safe
 */
export type ClassInfo = {
  /** Original class name as provided */
  original: string
  /** Prefix part (e.g., "md:", "hover:", "lg:") */
  prefix: string
  /** Parsed class type (e.g., "m", "p", "border") */
  type: string
  /** Class value (e.g., "4" in "m-4", "red-500" in "bg-red-500") */
  value: string
  /** Whether this class has negative modifier */
  isNegative: boolean
  /** Optional category for grouping related classes */
  category?: string
}

/**
 * Result type for base class parsing
 */
type ParseResult = {
  type: string
  value: string
  isNegative: boolean
  category?: string
}

/**
 * Parse classes into improved flattened structure
 */
export function parseClasses(classes: string[]): ClassInfo[] {
  return classes.map((className) => parseClass(className))
}

/**
 * Parse a single class into improved structure
 */
export function parseClass(className: string): ClassInfo {
  const { prefix, baseClass } = splitPrefixAndBase(className)
  const baseInfo = parseBaseClass(baseClass)

  return {
    original: className,
    prefix,
    type: baseInfo.type,
    value: baseInfo.value,
    isNegative: baseInfo.isNegative,
    category: baseInfo.category,
  }
}

/**
 * Split class name into prefix and base class
 */
function splitPrefixAndBase(className: string): {
  prefix: string
  baseClass: string
} {
  const colonIndex = className.lastIndexOf(":")
  if (colonIndex !== -1) {
    const prefix = className.substring(0, colonIndex + 1)
    const baseClass = className.substring(colonIndex + 1)
    return { prefix, baseClass }
  }
  return { prefix: "", baseClass: className }
}

/**
 * Parse base class into type, value, and other properties
 */
function parseBaseClass(baseClass: string): ParseResult {
  // Handle negative values
  const isNegative = baseClass.startsWith("-")
  const cleanClass = isNegative ? baseClass.substring(1) : baseClass

  // Define parsers for different class types
  const parsers = [
    parseBorderSpacing,
    parseBorder,
    parseRounded,
    parseInset,
    parsePosition,
    parseScrollMargin,
    parseScrollPadding,
    parseGap,
    parseGridFlexbox,
    parseTransform,
    parseOverflow,
    parseOverscroll,
    parseGeneric,
  ]

  for (const parser of parsers) {
    const result = parser(cleanClass, isNegative)
    if (result) return result
  }

  // Fallback for unparseable classes
  return {
    type: cleanClass,
    value: "",
    isNegative,
  }
}

// =============================================================================
// Specific Parsers
// =============================================================================

function parseBorderSpacing(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("border-spacing-")) return null

  const spacingPart = cleanClass.substring(15)
  const directionMatch = spacingPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `border-spacing-${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "misc",
    }
  }

  return {
    type: "border-spacing",
    value: spacingPart,
    isNegative,
    category: "misc",
  }
}

function parseBorder(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("border-")) return null

  const borderPart = cleanClass.substring(7)
  const directionMatch = borderPart.match(/^([tlbr]|[xy]|s|e)-(.+)$/)

  if (directionMatch) {
    return {
      type: `border-${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "border-width-color",
    }
  }

  return {
    type: "border",
    value: borderPart,
    isNegative,
    category: "border-width-color",
  }
}

function parseRounded(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("rounded-")) return null

  const roundedPart = cleanClass.substring(8)

  // Corner-specific rounded with value
  const cornerMatch = roundedPart.match(/^(tl|tr|bl|br|ss|se|es|ee)-(.+)$/)
  if (cornerMatch) {
    return {
      type: `rounded-${cornerMatch[1]}`,
      value: cornerMatch[2],
      isNegative,
      category: "border-radius",
    }
  }

  // Corner-specific rounded without value (default size)
  const cornerNoValueMatch = roundedPart.match(/^(tl|tr|bl|br|ss|se|es|ee)$/)
  if (cornerNoValueMatch) {
    return {
      type: `rounded-${cornerNoValueMatch[1]}`,
      value: "",
      isNegative,
      category: "border-radius",
    }
  }

  // Side-specific rounded with value
  const sideMatch = roundedPart.match(/^([tlbr]|s|e)-(.+)$/)
  if (sideMatch) {
    return {
      type: `rounded-${sideMatch[1]}`,
      value: sideMatch[2],
      isNegative,
      category: "border-radius",
    }
  }

  // Side-specific rounded without value (default size)
  const sideNoValueMatch = roundedPart.match(/^([tlbr]|s|e)$/)
  if (sideNoValueMatch) {
    return {
      type: `rounded-${sideNoValueMatch[1]}`,
      value: "",
      isNegative,
      category: "border-radius",
    }
  }

  return {
    type: "rounded",
    value: roundedPart,
    isNegative,
    category: "border-radius",
  }
}

function parseInset(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("inset-")) return null

  const insetPart = cleanClass.substring(6)
  const directionMatch = insetPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `inset-${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "layout-inset",
    }
  }

  return {
    type: "inset",
    value: insetPart,
    isNegative,
    category: "layout-inset",
  }
}

function parsePosition(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  const positionTypes = ["top", "bottom", "left", "right", "start", "end"]
  const firstPart = cleanClass.split("-")[0]

  if (!positionTypes.includes(firstPart)) return null

  const dashIndex = cleanClass.indexOf("-")
  if (dashIndex === -1) return null

  const type = cleanClass.substring(0, dashIndex)
  const classValue = cleanClass.substring(dashIndex + 1)

  return {
    type,
    value: classValue,
    isNegative,
    category: "layout-inset",
  }
}

function parseScrollMargin(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("scroll-m")) return null

  const scrollPart = cleanClass.substring(8)

  // Directional scroll margin
  const directionMatch = scrollPart.match(/^(t|b|l|r|x|y|s|e)-(.+)$/)
  if (directionMatch) {
    return {
      type: `scroll-m${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "layout-scroll",
    }
  }

  // Non-directional scroll margin
  const nonDirectionalMatch = scrollPart.match(/^-(.+)$/)
  if (nonDirectionalMatch) {
    return {
      type: "scroll-m",
      value: nonDirectionalMatch[1],
      isNegative,
      category: "layout-scroll",
    }
  }

  return null
}

function parseScrollPadding(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("scroll-p")) return null

  const scrollPart = cleanClass.substring(8)

  // Directional scroll padding
  const directionMatch = scrollPart.match(/^(t|b|l|r|x|y|s|e)-(.+)$/)
  if (directionMatch) {
    return {
      type: `scroll-p${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "layout-scroll",
    }
  }

  // Non-directional scroll padding
  const nonDirectionalMatch = scrollPart.match(/^-(.+)$/)
  if (nonDirectionalMatch) {
    return {
      type: "scroll-p",
      value: nonDirectionalMatch[1],
      isNegative,
      category: "layout-scroll",
    }
  }

  return null
}

function parseGap(cleanClass: string, isNegative: boolean): ParseResult | null {
  if (!cleanClass.startsWith("gap-")) return null

  const gapPart = cleanClass.substring(4)
  const directionMatch = gapPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `gap-${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "layout-gap",
    }
  }

  return {
    type: "gap",
    value: gapPart,
    isNegative,
    category: "layout-gap",
  }
}

function parseGridFlexbox(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("justify-") && !cleanClass.startsWith("align-"))
    return null

  const isJustify = cleanClass.startsWith("justify-")
  const prefix = isJustify ? "justify-" : "align-"
  const rest = cleanClass.substring(prefix.length)

  const typeMatch = rest.match(/^(items|content|self)-(.+)$/)
  if (typeMatch) {
    return {
      type: `${prefix}${typeMatch[1]}`,
      value: typeMatch[2],
      isNegative,
      category: "grid-flexbox",
    }
  }

  return null
}

function parseTransform(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  const transformTypes = ["translate", "scale", "skew"]
  const transformType = transformTypes.find((type) =>
    cleanClass.startsWith(`${type}-`),
  )

  if (!transformType) return null

  const transformMatch = cleanClass.match(
    new RegExp(`^${transformType}-([xy])-(.+)$`),
  )
  if (transformMatch) {
    return {
      type: `${transformType}-${transformMatch[1]}`,
      value: transformMatch[2],
      isNegative,
      category: "transform",
    }
  }

  return null
}

function parseOverflow(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("overflow-")) return null

  const overflowPart = cleanClass.substring(9)
  const directionMatch = overflowPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `overflow-${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "misc",
    }
  }

  return {
    type: "overflow",
    value: overflowPart,
    isNegative,
    category: "misc",
  }
}

function parseOverscroll(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  if (!cleanClass.startsWith("overscroll-")) return null

  const overscrollPart = cleanClass.substring(11)
  const directionMatch = overscrollPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `overscroll-${directionMatch[1]}`,
      value: directionMatch[2],
      isNegative,
      category: "misc",
    }
  }

  return {
    type: "overscroll",
    value: overscrollPart,
    isNegative,
    category: "misc",
  }
}

function parseGeneric(
  cleanClass: string,
  isNegative: boolean,
): ParseResult | null {
  const dashIndex = cleanClass.indexOf("-")
  if (dashIndex === -1) return null

  const type = cleanClass.substring(0, dashIndex)
  const classValue = cleanClass.substring(dashIndex + 1)

  return { type, value: classValue, isNegative }
}
