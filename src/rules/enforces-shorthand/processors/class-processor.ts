import { applyShorthands } from "../../../shorthand"
import type { ProcessingResult } from "../types"

/**
 * Core class processing logic
 * Applies shorthand transformations to class names
 */
export function processClassNames(classValue: string): ProcessingResult {
  return applyShorthands(classValue)
}
