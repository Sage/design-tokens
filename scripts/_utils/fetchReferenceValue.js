/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

module.exports = function (token) {
  if (String(token.original?.value).startsWith('{') && typeof token.value === 'object') {
    return token.value?.value
  }

  return token.value
}
