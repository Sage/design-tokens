import { readFileSync } from 'fs';

// Helper to parse CSS custom properties
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
