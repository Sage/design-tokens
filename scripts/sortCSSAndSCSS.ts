/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

import fs from "fs-extra"
import { resolve, dirname } from "path"
import { sync } from "glob"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Sort CSS or SCSS properties/variables alphabetically within their respective blocks.
 * 
 * For CSS: Extracts content from :root { } blocks, sorts each property line by name,
 * then reconstructs the formatted block with proper indentation.
 * 
 * For SCSS: Splits entire file into lines, filters for variable declarations ($name)
 * and sorts them alphabetically before rejoining.
 * 
 * @param content The file content to sort
 * @param isCss True for CSS files, false for SCSS files
 * @returns Sorted file content with same formatting structure
 */
function sortProperties(content: string, isCss: boolean = true): string {
  if (isCss) {
    // For CSS: sort properties within :root blocks
    // Pattern matches :root { ... } blocks and sorts the CSS properties inside
    return content.replace(/:root\s*\{([^}]+)\}/g, (_match: string, rootContent: string) => {
      const lines = rootContent
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && line.startsWith('--'))
      
      // Sort by property name (the part before the colon)
      const sorted = lines.sort((a: string, b: string) => {
        const aName = a.split(':')[0] || ''
        const bName = b.split(':')[0] || ''
        return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
      })
      
      // Reconstruct :root block with proper indentation
      const indent = sorted.map((line: string) => `  ${line}`).join('\n')
      return `:root {\n${indent}\n}`
    })
  } else {
    // For SCSS: sort variables at root level
    // Filter for variable declarations and sort them alphabetically
    const lines = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.startsWith('$'))
    
    // Sort by variable name (the part before the colon)
    const sorted = lines.sort((a: string, b: string) => {
      const aName = a.split(':')[0] || ''
      const bName = b.split(':')[0] || ''
      return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
    })
    
    return sorted.join('\n') + '\n'
  }
}

/**
 * Sort all CSS and SCSS files in the dist directories after build completion.
 * 
 * This function is called by postbuild.ts after Style Dictionary generates output files.
 * It finds all CSS and SCSS files and applies alphabetical sorting to their properties/variables.
 * 
 * CSS: Skips light-all.css as it has a different structure (aggregated file)
 * SCSS: Processes all generated SCSS files
 */
function sortCSSAndSCSSFiles() {
  try {
    const distPath = resolve(__dirname, "../dist")
    
    // Sort CSS files - find all .css files in dist/css and its subdirectories
    const cssFiles = sync(`${distPath}/css/**/*.css`)
    cssFiles.forEach(filePath => {
      // Skip light-all.css as it has special formatting and is handled separately
      if (!filePath.includes('light-all.css')) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const sorted = sortProperties(content, true)
        fs.writeFileSync(filePath, sorted)
      }
    })
    console.log(`✅ Sorted ${cssFiles.length} CSS files`)

    // Sort SCSS files - find all .scss files in dist/scss and its subdirectories
    const scssFiles = sync(`${distPath}/scss/**/*.scss`)
    scssFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8')
      const sorted = sortProperties(content, false)
      fs.writeFileSync(filePath, sorted)
    })
    console.log(`✅ Sorted ${scssFiles.length} SCSS files`)
  } catch (err) {
    throw new Error(`Error sorting CSS and SCSS files: ${err}`)
  }
}

export { sortCSSAndSCSSFiles }
