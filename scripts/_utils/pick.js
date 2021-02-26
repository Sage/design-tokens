/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Strips all properties from an object except those that are in the allowdList
 * not recursive
 *
 * @param {Object} input - The input object to "pick from"
 * @param {String[]} allowedList - The list of allowed properties
 *
 * @returns {Object}
 */
function pick (input, allowedList = []) {
  return Object.assign(
    {},
    ...allowedList.map((key) => ({ [key]: input[key] }))
  )
}

module.exports = pick
