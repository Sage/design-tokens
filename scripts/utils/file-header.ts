/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Gets the filename for a file
 */

export const HeaderContents = (isScss: Boolean): string => {
  const year = new Date().getFullYear()

  // As consumers will still need to compile the SCSS files to CSS themselves
  // we use a single line comment format to not add to their compiled CSS files
  if (isScss) {
    return `// Copyright © ${year} The Sage Group plc or its licensors. All Rights reserved`
  }

  return `/**
 * Copyright © ${year} The Sage Group plc or its licensors. All Rights reserved
 */`
}
