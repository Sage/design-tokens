/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/*

*/

const filterComponent = (token, componentName) => token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true)

module.exports = filterComponent
