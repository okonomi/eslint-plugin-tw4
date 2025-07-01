export type ClassDetail = {
  /** Prefix part (e.g., "md:", "hover:", "lg:") */
  prefix: string
  /** Parsed class type (e.g., "m", "p", "border") */
  type: string
  /** Class value (e.g., "4" in "m-4", "red-500" in "bg-red-500") */
  value: string
  /** Whether this class has negative modifier */
  isNegative: boolean
  /** Important modifier type: 'leading' (!class), 'trailing' (class!), or null */
  important: "leading" | "trailing" | null
}

export function emitClassName(classDetail: ClassDetail): string {
  const base = emitBaseClassName(classDetail)

  if (classDetail.important === "leading") {
    return `${classDetail.prefix}!${base}`
  }
  if (classDetail.important === "trailing") {
    return `${classDetail.prefix}${base}!`
  }

  return `${classDetail.prefix}${base}`
}

export function emitBaseClassName(classDetail: ClassDetail): string {
  const negativePrefix = classDetail.isNegative ? "-" : ""
  const valuePart = classDetail.value === "" ? "" : `-${classDetail.value}`

  return `${negativePrefix}${classDetail.type}${valuePart}`
}
