/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Function that selectsunique values of a given fild in whole collection.
 * @param {object[]} array - Array of objects
 * @param {string} key - Property name
 * @returns {string[]}
 */
// module.exports = (array, key) => array.map(item => item[key]).filter((value, index, self) => self.indexOf(value) === index)
module.exports = (array, mapFn) => array.map(mapFn).filter((value, index, self) => self.indexOf(value) === index)
