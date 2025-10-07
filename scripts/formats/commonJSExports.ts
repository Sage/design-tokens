import { Dictionary, DesignToken } from "style-dictionary/types";

/**
 * Custom format to output ensure commonJS variables output in the same format as ESM
 * This only runs on non-component files as components are handled in commonJSWithRefs
 * @param dictionary The style dictionary object containing all tokens
 * @returns The processed commonJS variables in the same format as the ES6 output
 */
export const formatCommonJSExports = ({dictionary}: {dictionary: Dictionary}) => {
  const tokens = dictionary.allTokens
    .map((token: DesignToken) => {
      return `module.exports.${token.name} = "${token.$value || token.value}";`;
    })
    .join('\n');

  return tokens + '\n';
}
