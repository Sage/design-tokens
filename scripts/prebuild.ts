/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(() => {
  console.log('Clearing /dist folder...')
  fs.removeSync(resolve(__dirname, '../dist'))
  console.log('Done.\r\n')
})()

