/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Gets the filename for a file
 *
 * @param {string} filename - the name of the file
 *
 * @returns {string}
 */

module.exports = (filename) => {
  const availablePresenters = ['Animation', 'Border', 'BorderRadius', 'Color', 'Easing', 'FontFamily', 'FontSize', 'FontWeight', 'LetterSpacing', 'LineHeight', 'Opacity', 'Shadow', 'Spacing']
  const FileName = filename[0].toUpperCase() + filename.slice(1)

  return availablePresenters.indexOf(FileName) > -1 ? `* @presenter ${FileName}` : ''
}
