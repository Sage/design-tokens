import type { DesignToken } from 'style-dictionary/types';


/**
 * Helper: Removes comments from output
 * scss/variables format automatically adds comments from the $description property
 */
export const removeComments = (token: DesignToken): DesignToken => {
  const _t = token;
  
  if (_t.comment) {
    delete _t.comment;
  }
  if (_t['original'] && _t['original'].comment) {
    delete _t['original'].comment;
  }
  if (_t['original'] && _t['original'].$description) {
    delete _t['original'].$description;
  }
  if (_t.$description) {
    delete _t.$description;
  }

  return _t;
}
