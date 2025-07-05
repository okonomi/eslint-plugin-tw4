import type { RuleOptions } from "./types"

/**
 * Default options for the enforces-shorthand rule
 */
export const DEFAULT_OPTIONS: Required<RuleOptions> = {
  callees: ["classnames", "clsx", "ctl", "cva"],
  config: {},
  skipClassAttribute: false,
  tags: ["tw", "styled", "myTag"],
}

/**
 * Parse and validate rule options with defaults
 */
export function parseOptions(options: RuleOptions = {}): Required<RuleOptions> {
  return {
    callees: options.callees ?? DEFAULT_OPTIONS.callees,
    config: options.config ?? DEFAULT_OPTIONS.config,
    skipClassAttribute:
      options.skipClassAttribute ?? DEFAULT_OPTIONS.skipClassAttribute,
    tags: options.tags ?? DEFAULT_OPTIONS.tags,
  }
}
