import { readFileSync } from 'fs';

/**
 * Shared test utilities for token ordering verification.
 * 
 * This module provides reusable helpers for parsing token files and checking
 * alphabetical ordering. These utilities are used across all test files
 * (JSON, ES6, CommonJS, CSS, SCSS) to ensure consistent test logic.
 * 
 * Key utilities:
 * - isAlphabetical(): Check if tokens are in a-z order (single source of truth for comparison logic)
 * - getTokenNames(): Extract names from parsed file data
 * - parse*File(): Format-specific parsers for different file types
 */

/**
 * Verify that an array of strings is in alphabetical order.
 * 
 * This is the single source of truth for ordering validation across all test files.
 * Uses case-insensitive, numeric-aware comparison (same as sortAlphabetically in sortTokens.ts).
 * 
 * @param items Array of token/property names to check
 * @returns True if items are strictly in ascending alphabetical order, false otherwise
 */
export function isAlphabetical(items: string[]): boolean {
  for (let i = 1; i < items.length; i++) {
    const current = items[i]
    const previous = items[i - 1]
    if (!current || !previous) return false
    if (current.localeCompare(previous, undefined, { numeric: true, sensitivity: 'base' }) < 0) {
      return false
    }
  }
  return true
}

/**
 * Extract token/property names from parsed file data in the order they appear.
 * 
 * @param fileData Map of token names to values (returned by parse*File functions)
 * @returns Array of token names in the order they appear in the Map
 */
export function getTokenNames(fileData: Map<string, string>): string[] {
  return Array.from(fileData.keys())
}

export function parseCSSFile(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const tokens = new Map<string, string>();
  
  // Match CSS custom properties: --token-name: value;
  const regex = /--([^:]+):\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) tokens.set(match[1].trim(), match[2].trim());
  }
  
  return tokens;
}
  
// Helper to parse JSON file
export function parseJSONFile(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  const tokens = new Map<string, string>();
  
  Object.entries(data).forEach(([key, value]) => {
    tokens.set(key, String(value));
  });
  
  return tokens;
}
  
// Helper to parse CommonJS file
export function parseCommonJSFile(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const tokens = new Map<string, string>();
  
  // Match: module.exports.tokenName = "value";
  const regex = /module\.exports\.(\w+)\s*=\s*"([^"]+)";/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) tokens.set(match[1], match[2]);
  }
  
  return tokens;
}

// Helper to parse ES6 file
export function parseES6File(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const tokens = new Map<string, string>();
  
  // Match: export const tokenName = "value";
  const regex = /export const (\w+)\s*=\s*"([^"]+)";/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) tokens.set(match[1], match[2]);
  }
  
  return tokens;
}

/**
 * Parse SCSS file and extract variable declarations.
 * Reads an SCSS file and extracts all variable declarations (starting with $).
 * Preserves the order variables appear in the file.
 */
export function parseSCSSFile(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, 'utf-8');
  const tokens = new Map<string, string>();
  
  // Match: $variable-name: value;
  const regex = /\$([^:\s]+)\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) tokens.set(match[1], match[2].trim());
  }
  
  return tokens;
}

// Helper to convert kebab-case to camelCase
export function kebabToCamel(str: string): string {
  return str
    .split('-')
    .map((part, index) => {
      // First part stays lowercase
      if (!index) return part;
      
      // If part starts with a number, keep it as-is
      if (/^\d/.test(part)) return part;
      
      // Otherwise capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}
