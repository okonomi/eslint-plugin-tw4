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
  /** Whether this class has important modifier */
  isImportant: boolean
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

type ParseFuncResult = {
  type: string
  value: string
  category?: string
}

type ParseFunc = (cleanClass: string) => ParseFuncResult | null

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
  const { prefix, baseClass, isImportant } = splitPrefixAndBase(className)

  // Check for invalid case where both leading and trailing important are present
  // splitPrefixAndBase returns { prefix: "", baseClass: className, isImportant: false } for invalid cases
  // We can detect this by checking if baseClass contains both leading and trailing important
  const isInvalidCase =
    prefix === "" &&
    baseClass === className &&
    !isImportant &&
    className.includes("!") &&
    className.indexOf("!") !== className.lastIndexOf("!")

  if (isInvalidCase) {
    return {
      original: className,
      prefix: "",
      type: className,
      value: "",
      isNegative: false,
      isImportant: false,
    }
  }

  const baseInfo = parseBaseClass(baseClass)

  return {
    original: className,
    prefix,
    type: baseInfo.type,
    value: baseInfo.value,
    isNegative: baseInfo.isNegative,
    isImportant: isImportant,
    category: baseInfo.category,
  }
}

/**
 * Split class name into prefix, base class, and important modifier
 */
function splitPrefixAndBase(className: string): {
  prefix: string
  baseClass: string
  isImportant: boolean
} {
  // Check for important modifier (!) at the end
  const hasTrailingImportant = className.endsWith("!")
  const classWithoutTrailingImportant = hasTrailingImportant
    ? className.slice(0, -1)
    : className

  const colonIndex = classWithoutTrailingImportant.lastIndexOf(":")
  let prefix = ""
  let baseClassWithPrefix = classWithoutTrailingImportant

  if (colonIndex !== -1) {
    prefix = classWithoutTrailingImportant.substring(0, colonIndex + 1)
    baseClassWithPrefix = classWithoutTrailingImportant.substring(
      colonIndex + 1,
    )
  }

  // Check for important modifier (!) at the beginning of base class
  const hasLeadingImportant = baseClassWithPrefix.startsWith("!")
  const baseClass = hasLeadingImportant
    ? baseClassWithPrefix.slice(1)
    : baseClassWithPrefix

  // Check for invalid case: both leading and trailing important
  if (hasLeadingImportant && hasTrailingImportant) {
    // Invalid case: both !class-name! - return the whole thing as unparseable
    return { prefix: "", baseClass: className, isImportant: false }
  }

  const isImportant = hasLeadingImportant || hasTrailingImportant

  return { prefix, baseClass, isImportant }
}

/**
 * Parse base class into type, value, and other properties
 */
function parseBaseClass(baseClass: string): ParseResult {
  // Handle negative values
  const isNegative = baseClass.startsWith("-")
  const cleanClass = isNegative ? baseClass.substring(1) : baseClass

  // Define parsers for different class types
  const parsers: ParseFunc[] = [
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
    const result = parser(cleanClass)
    if (result) {
      return {
        ...result,
        isNegative,
      }
    }
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

const parseBorderSpacing: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("border-spacing-")) return null

  const spacingPart = cleanClass.substring(15)
  const directionMatch = spacingPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `border-spacing-${directionMatch[1]}`,
      value: directionMatch[2],
      category: "misc",
    }
  }

  return {
    type: "border-spacing",
    value: spacingPart,
    category: "misc",
  }
}

const parseBorder: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("border-")) return null

  const borderPart = cleanClass.substring(7)

  // Check for direction with value (e.g., border-x-2, border-y-4)
  const directionWithValueMatch = borderPart.match(/^([tlbr]|[xy]|s|e)-(.+)$/)
  if (directionWithValueMatch) {
    return {
      type: `border-${directionWithValueMatch[1]}`,
      value: directionWithValueMatch[2],
      category: "border-width-color",
    }
  }

  // Check for direction without value (e.g., border-x, border-y, border-t)
  const directionMatch = borderPart.match(/^([tlbr]|[xy]|s|e)$/)
  if (directionMatch) {
    return {
      type: `border-${directionMatch[1]}`,
      value: "",
      category: "border-width-color",
    }
  }

  // Default border with value (e.g., border-2, border-red-500)
  return {
    type: "border",
    value: borderPart,
    category: "border-width-color",
  }
}

const parseRounded: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("rounded-")) return null

  const roundedPart = cleanClass.substring(8)

  // Corner-specific rounded with value
  const cornerMatch = roundedPart.match(/^(tl|tr|bl|br|ss|se|es|ee)-(.+)$/)
  if (cornerMatch) {
    return {
      type: `rounded-${cornerMatch[1]}`,
      value: cornerMatch[2],
      category: "border-radius",
    }
  }

  // Corner-specific rounded without value (default size)
  const cornerNoValueMatch = roundedPart.match(/^(tl|tr|bl|br|ss|se|es|ee)$/)
  if (cornerNoValueMatch) {
    return {
      type: `rounded-${cornerNoValueMatch[1]}`,
      value: "",
      category: "border-radius",
    }
  }

  // Side-specific rounded with value
  const sideMatch = roundedPart.match(/^([tlbr]|s|e)-(.+)$/)
  if (sideMatch) {
    return {
      type: `rounded-${sideMatch[1]}`,
      value: sideMatch[2],
      category: "border-radius",
    }
  }

  // Side-specific rounded without value (default size)
  const sideNoValueMatch = roundedPart.match(/^([tlbr]|s|e)$/)
  if (sideNoValueMatch) {
    return {
      type: `rounded-${sideNoValueMatch[1]}`,
      value: "",
      category: "border-radius",
    }
  }

  return {
    type: "rounded",
    value: roundedPart,
    category: "border-radius",
  }
}

const parseInset: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("inset-")) return null

  const insetPart = cleanClass.substring(6)
  const directionMatch = insetPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `inset-${directionMatch[1]}`,
      value: directionMatch[2],
      category: "layout-inset",
    }
  }

  return {
    type: "inset",
    value: insetPart,
    category: "layout-inset",
  }
}

const parsePosition: ParseFunc = (cleanClass) => {
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
    category: "layout-inset",
  }
}

const parseScrollMargin: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("scroll-m")) return null

  const scrollPart = cleanClass.substring(8)

  // Directional scroll margin
  const directionMatch = scrollPart.match(/^(t|b|l|r|x|y|s|e)-(.+)$/)
  if (directionMatch) {
    return {
      type: `scroll-m${directionMatch[1]}`,
      value: directionMatch[2],
      category: "layout-scroll",
    }
  }

  // Non-directional scroll margin
  const nonDirectionalMatch = scrollPart.match(/^-(.+)$/)
  if (nonDirectionalMatch) {
    return {
      type: "scroll-m",
      value: nonDirectionalMatch[1],
      category: "layout-scroll",
    }
  }

  return null
}

const parseScrollPadding: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("scroll-p")) return null

  const scrollPart = cleanClass.substring(8)

  // Directional scroll padding
  const directionMatch = scrollPart.match(/^(t|b|l|r|x|y|s|e)-(.+)$/)
  if (directionMatch) {
    return {
      type: `scroll-p${directionMatch[1]}`,
      value: directionMatch[2],
      category: "layout-scroll",
    }
  }

  // Non-directional scroll padding
  const nonDirectionalMatch = scrollPart.match(/^-(.+)$/)
  if (nonDirectionalMatch) {
    return {
      type: "scroll-p",
      value: nonDirectionalMatch[1],
      category: "layout-scroll",
    }
  }

  return null
}

const parseGap: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("gap-")) return null

  const gapPart = cleanClass.substring(4)
  const directionMatch = gapPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `gap-${directionMatch[1]}`,
      value: directionMatch[2],
      category: "layout-gap",
    }
  }

  return {
    type: "gap",
    value: gapPart,
    category: "layout-gap",
  }
}

const parseGridFlexbox: ParseFunc = (cleanClass) => {
  // Handle justify- prefixed classes
  if (cleanClass.startsWith("justify-")) {
    const rest = cleanClass.substring("justify-".length)
    const typeMatch = rest.match(/^(items|content|self)-(.+)$/)
    if (typeMatch) {
      return {
        type: `justify-${typeMatch[1]}`,
        value: typeMatch[2],
        category: "grid-flexbox",
      }
    }
  }

  // Handle align- prefixed classes
  if (cleanClass.startsWith("align-")) {
    const rest = cleanClass.substring("align-".length)
    const typeMatch = rest.match(/^(items|content|self)-(.+)$/)
    if (typeMatch) {
      return {
        type: `align-${typeMatch[1]}`,
        value: typeMatch[2],
        category: "grid-flexbox",
      }
    }
  }

  // Handle Tailwind CSS shorthand classes (content-*, items-*, self-*)
  // These are treated as align-* equivalents
  const shorthandMatch = cleanClass.match(/^(content|items|self)-(.+)$/)
  if (shorthandMatch) {
    return {
      type: `align-${shorthandMatch[1]}`,
      value: shorthandMatch[2],
      category: "grid-flexbox",
    }
  }

  // Handle single justify-* classes (justify-center, justify-start, etc.)
  // These are treated as justify-content equivalents
  const justifyMatch = cleanClass.match(/^justify-(.+)$/)
  if (justifyMatch && !justifyMatch[1].includes("-")) {
    return {
      type: "justify-content",
      value: justifyMatch[1],
      category: "grid-flexbox",
    }
  }

  return null
}

const parseTransform: ParseFunc = (cleanClass) => {
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
      category: "transform",
    }
  }

  return null
}

const parseOverflow: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("overflow-")) return null

  const overflowPart = cleanClass.substring(9)
  const directionMatch = overflowPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `overflow-${directionMatch[1]}`,
      value: directionMatch[2],
      category: "misc",
    }
  }

  return {
    type: "overflow",
    value: overflowPart,
    category: "misc",
  }
}

const parseOverscroll: ParseFunc = (cleanClass) => {
  if (!cleanClass.startsWith("overscroll-")) return null

  const overscrollPart = cleanClass.substring(11)
  const directionMatch = overscrollPart.match(/^([xy])-(.+)$/)

  if (directionMatch) {
    return {
      type: `overscroll-${directionMatch[1]}`,
      value: directionMatch[2],
      category: "misc",
    }
  }

  return {
    type: "overscroll",
    value: overscrollPart,
    category: "misc",
  }
}

const parseGeneric: ParseFunc = (cleanClass) => {
  const dashIndex = cleanClass.indexOf("-")
  if (dashIndex === -1) return null

  const type = cleanClass.substring(0, dashIndex)
  const classValue = cleanClass.substring(dashIndex + 1)

  return {
    type,
    value: classValue,
  }
}
