/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Gets the filename for a file
 */

import { extname, basename } from 'path'

export const FileName = (filePath?: string): string | undefined => {
  const extension = filePath ? extname(filePath) : undefined
  return filePath ? basename(filePath, extension) : undefined
}
