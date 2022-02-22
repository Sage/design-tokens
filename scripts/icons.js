/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const Figma = require('figma-js')
const fetch = require('node-fetch')
const {
  outputFile,
  outputJson,
  removeSync,
  ensureDir,
  readFileSync
} = require('fs-extra')
const { generateFonts } = require('fantasticon')
const {
  join,
  relative,
  resolve,
  sep,
  posix
} = require('path')
const kebabCase = require('lodash/kebabCase')
const pick = require('lodash/pick')

const uniqueValues = require('./utils/unique-values')
const collect = require('./utils/collect')

require('dotenv').config()

async function getIconsArray (personalAccessToken, fileId) {
  console.log(`Fetching icon components information from Figma file ${fileId}...`)
  const client = Figma.Client({ personalAccessToken })

  const components = await client.file(fileId).then(({ data }) => {
    console.log(`  File name: ${data.name}`)
    console.log(`  Last modified: ${data.lastModified}`)

    const components = data.components
    const componentIds = Object.keys(components)
    const canvases = data.document.children.filter(node => node.type === 'CANVAS')
    const verifyFn = (node) => componentIds.includes(node?.id)

    const groupedComponents = Object.fromEntries(canvases.map(canvas => [canvas.name, collect(canvas, verifyFn).map(node => node.id)]))

    return Object.entries(groupedComponents)
      .map(([set, ids]) => ids.map(id => ({
        ...components[id],
        id,
        set
      }))).flat()
  })

  return await client.fileImages(fileId, {
    ids: components.map(component => component.id),
    format: 'svg',
    scale: 4
  }).then(({ data }) => components.map((component) => ({
    ...component,
    url: data.images[component.id]
  })))
}

async function fetchIconData (iconsList) {
  console.log('Fetching icons svg data...')
  return await Promise.all(
    iconsList.map(async (icon) => {
      return {
        ...icon,
        svg: await fetch(icon.url).then(response => {
          console.log(`  - Fetched ${icon.name} svg data from ${icon.url}`)
          return response.text()
        })
      }
    })
  ).then((data) => {
    console.log('Done.\r\n')
    return data
  })
}

async function writeIconsToSvg (iconsList, config) {
  console.log('Writing svg icons data to files...')
  return await Promise.all(
    iconsList.map(async (icon) => {
      const filePath = join(config.svgDir, kebabCase(icon.set), `${kebabCase(icon.name)}.svg`)

      return await outputFile(filePath, icon.svg).then(() => {
        console.log(`  - ${icon.name} written to ${filePath}`)
        return {
          ...icon,
          path: filePath
        }
      })
    })
  ).then((data) => {
    console.log('Done.\r\n')
    return data
  })
}

async function createWebFonts (iconsList, config) {
  console.log('Writing font files...')
  console.log(`  Using formats: ${config.formats.join(', ')} \r\n`)

  const sets = uniqueValues(iconsList, item => item.set)
  return await Promise.all(sets.map(async (set) => {
    const icons = iconsList.filter(icon => icon.set === set)
    const name = `${config.fontName}-${set}`
    const inputDir = resolve('.', config.svgDir, set)
    const outputDir = resolve('.', config.fontsDir)

    ensureDir(outputDir)

    return generateFonts({
      name,
      inputDir,
      outputDir,
      fontTypes: config.formats,
      formatOptions: {
        ttf: config.meta
      },
      assetTypes: [],
      fontHeight: 1000
    }).then((results) => {
      console.log(`  - ${name} set formats written in ${outputDir} in ${config.formats.length} formats`)

      const { codepoints } = results

      return icons.map(icon => {
        const codepoint = codepoints[kebabCase(icon.name)]

        return {
          ...icon,
          path: relative(config.distDir, icon.path).split(sep).join(posix.sep),
          codepoint,
          glyph: String.fromCodePoint(codepoint),
          unicode: String.fromCodePoint(codepoint).charCodeAt(0).toString(16)
        }
      })
    })
  })).then((results) => {
    console.log('Done.\r\n')
    return results
  })
}

async function writeGlyphsData (glyphsData, config) {
  console.log('Writing glyph data...')
  const glyphsDataFilePath = resolve(config.dataDir, 'glyphs.json')
  const sets = uniqueValues(glyphsData, item => item.set)
  console.log(`  Writing data for ${glyphsData.length} in ${sets.length} sets`)

  await outputJson(glyphsDataFilePath, glyphsData).then(() => {
    console.log(`  - glyphs data in file: ${glyphsDataFilePath}`)
    console.log('Done.\r\n')
  })
}

function createDocs (glyphsData, config) {
  console.log('Creating documentation for icons...')

  const buildDocsFile = require('./handlebars')(config.docsPartials)

  const mappedGlyphsData = glyphsData.map(icon => {
    const fullIconPath = resolve(config.distDir, icon.path)
    const relativePath = relative(config.docsDir, fullIconPath)

    return {
      ...icon,
      srcPath: relativePath
    }
  })

  const template = readFileSync(config.mainTemplate, 'utf8')

  const context = {
    glyphs: mappedGlyphsData,
    title: 'Sage Icons Preview',
    bodyType: 'icons'
  }

  console.log(resolve(process.cwd(), config.docsDir, 'index.html'))

  buildDocsFile(template, context, [config.docsDir, 'index.html'])
  console.log('Done.\r\n')
}

/**
 * @typedef {Object} IconsConfig
 * @property {string} personalAccessToken - personal access token for figma
 * @property {string} fileId - id of a figma file
 * @property {string} distDir - main output directory
 * @property {string} svgDir - directory for svg files
 * @property {string} fontsDir - directory for font files
 * @property {string} dataDir - directory for JSON file
 * @property {string} docsDir - output file for icon docs
 * @property {string} fontName - name of the font
 * @property {array} formats - formats to be generated ('svg', 'ttf', 'woff', 'woff2', 'eot')as in th
 * @property {string} docsTemplate - path to handlebars template for docs
 * @property {object} meta - meta information for font files.
 * @property {string} meta.description - font files description
 * @property {string} meta.url - url for a font manufacturer
 * @property {string} meta.copyright - copyright information
 * @property {string} meta.version - font version number
 */

/**
 *
 * @param {IconsConfig} config - config for icons generator
 * @returns {Promise<void>}
 */
(async (config) => {
  if (!config.fileId || !config.personalAccessToken) {
    console.error('Icons will not be generated, since token and figma file id were not found.')
    console.error('Please provide FIGMA_ACCESS_TOKEN and FIGMA_FILE_ID env variables or in .env file.\r\n')
    return
  }

  removeSync(config.svgDir)
  removeSync(config.dataDir)
  removeSync(config.fontsDir)

  const iconsList = await getIconsArray(config.personalAccessToken, config.fileId)
  const iconsData = await fetchIconData(iconsList)
  const svgIcons = await writeIconsToSvg(iconsData, config)
  const glyphsData = await createWebFonts(svgIcons, config)

  const formattedGlyphsData = glyphsData.flat()
    .map((icon) => pick(icon, ['name', 'set', 'description', 'documentationLinks', 'path', 'codepoint', 'glyph', 'unicode']))
    .map((icon) => ({
      ...icon,
      name: kebabCase(icon.name)
    }))

  await writeGlyphsData(formattedGlyphsData, config)
  createDocs(formattedGlyphsData, config)
})({
  personalAccessToken: process.env.FIGMA_ACCESS_TOKEN,
  fileId: process.env.FIGMA_FILE_ID,
  distDir: './dist',
  svgDir: './dist/assets/icons/svg',
  fontsDir: './dist/assets/icons/fonts',
  dataDir: './dist/assets/icons/data',
  fontName: 'sage-icons',
  formats: ['svg', 'woff', 'woff2', 'ttf', 'eot'],
  mainTemplate: './templates/layout.hbs',
  docsDir: './dist/docs/icons/',
  docsPartials: './templates/partials/**/*.hbs',
  meta: {
    description: 'Sage Icon Font',
    url: 'http://sage.com',
    copyright: 'Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved.',
    version: '1.0'
  }
})
