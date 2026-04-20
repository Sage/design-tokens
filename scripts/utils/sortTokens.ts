/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Sort strings alphabetically using case-insensitive, numeric-aware comparison.
 * This function is the core sorting implementation used by all format handlers.
 * 
 * Sorting behavior:
 * - "button-bg-default" < "button-border-default" (alphabetical)
 * - "v1" < "v2" < "v10" (numeric sorting, not lexical)
 * - "Badge" sorts same position as "badge" (case-insensitive)
 *
 * @param a First value to compare
 * @param b Second value to compare
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function sortAlphabetically(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Extract property/token names from mixed items and return sorted array.
 * Useful for converting objects with name properties into a sorted string array.
 * 
 * @param items Array of either strings directly or objects with a name property
 * @returns Array of names sorted alphabetically using sortAlphabetically()
 * 
 * @example
 * // From object array with name property:
 * const exports = [{name: "token1"}, {name: "token2"}]
 * extractAndSort(exports) // => ["token1", "token2"]
 * 
 * // From plain string array:
 * extractAndSort(["button", "badge"]) // => ["badge", "button"]
 */
export function extractAndSort(items: (string | { name: string })[]): string[] {
  return items
    .map(item => typeof item === 'string' ? item : item.name)
    .sort(sortAlphabetically)
}
