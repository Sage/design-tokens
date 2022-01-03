/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const isNumber = require('lodash/isNumber')
const isString = require('lodash/isString')

/**
 * Ensures that input has pixel units if needed
 * @param input
 * @returns {string|*}
 */
module.exports = (input) => {
  if (isString(input) && input.includes('px')) {
    return input
  }

  if (isString(input) && input === '0') {
    return input
  }

  if (isNumber(input) && input === 0) {
    return input.toString()
  }

  return `${input.toString()}px`
}
