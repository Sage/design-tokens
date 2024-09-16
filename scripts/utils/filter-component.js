/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Gets the filename for a file
 *
 * @param {object} token - the design token
 * @param {string} componentName - the name of the component
 *
 * @returns {boolean}
 */

const filterComponent = (token, componentName) => token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : false)

module.exports = filterComponent
