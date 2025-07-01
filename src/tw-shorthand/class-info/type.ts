export type ClassInfo = {
  /** Original class name as provided */
  original: string
  /** Optional category for grouping related classes */
  category?: string
  /** Base class name without prefix and important modifiers */
  baseClass: string
  /** Detailed information about the class */
  detail: ClassDetail
}

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
