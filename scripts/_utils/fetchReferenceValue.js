/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Function that fetches value if it is a reference value in form
 * of path inside brackets, e.g. {set.category.name.variant}
 *
 * @param token
 * @returns {string|number}
 */
module.exports = function (token) {
  if (String(token.original?.value).startsWith('{') && typeof token.value === 'object') {
    return token.value?.value
  }

  return token.value
}
