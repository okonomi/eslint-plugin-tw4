import { applyShorthands } from "../../../shorthand"
import type { ProcessingResult, TailwindConfig } from "../types"

/**
 * Core class processing logic
 * Applies shorthand transformations to class names
 */
export function processClassNames(
  classValue: string,
  config?: TailwindConfig,
): ProcessingResult {
  return applyShorthands(classValue, config)
}
