/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const filterTheme = (theme) => (token) => token.attributes.theme === theme

module.exports = filterTheme
