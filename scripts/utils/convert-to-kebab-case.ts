/**
 * Helper: Converts a reference path to proper kebab-case for CSS variable names
 * @param refPath The reference path (e.g., "mode.color.action.mainWithDefault")
 * @returns The kebab-case CSS variable name
 */
export const convertToKebabCase = (refPath: string): string => {
  return refPath
    .split('.')
    .map(segment => {
      // Convert camelCase segments to kebab-case
      return segment
        .replace(/([a-z\d])([A-Z])/g, '$1-$2') // Handle lowercase/digit + uppercase
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Handle consecutive capitals
        .toLowerCase();
    })
    .join('-');
};
