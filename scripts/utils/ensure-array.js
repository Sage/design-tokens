/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
/**
 * Ensures that given input is array.
 * @param input
 * @returns {*|*[]}
 */
module.exports = (input) => Array.isArray(input) ? input : [input]
