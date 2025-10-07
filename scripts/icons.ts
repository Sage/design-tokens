/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

import Figma from 'figma-js'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import { FontAssetType, generateFonts } from 'fantasticon'
import {
  join,
  relative,
  resolve,
  sep,
  posix
} from 'path'
import kebabCase from 'lodash/kebabCase.js'
import pick from 'lodash/pick.js'

import { UniqueValues } from './utils/unique-values.js'
import { Collect } from './utils/collect.js'

interface IConfig {
  personalAccessToken: string | undefined
  fileId: string | undefined
  pages: string[]
  multipleSets: boolean
  distDir: string
  svgDir: string
  fontsDir: string
  dataDir: string
  fontName: string
  formats: FontAssetType[]
  mainTemplate: string
  docsDir: string
  docsPartials: string
  meta: IMeta
}

interface IMeta {
  description: string
  url: string
  copyright: string
  version: string
}

export interface IIcon {
  url: string | undefined
  unicode?: string
  description?: string
  key?: string
  name?: string
  id: any
  path?: string
  set: string | undefined
  svg?: string
}

export interface IGlyphData {
  name: string | undefined
  path?: string
  codepoint?: number
  glyph?: string
  unicode?: string
  url?: string | undefined
  description?: string
  key?: string
  id?: any
  set?: string | undefined
  svg?: string
}

const getDataFromDescription = (description: string) => {
  const output: { unicode?: string, description?:string } = {}
  const unicodeMatch = description.match(/code: ?([a-zA-Z0-9]{4})\s?/)

  if (unicodeMatch && unicodeMatch[1]) {
    output.unicode = unicodeMatch[1]
    output.description = description.replace(unicodeMatch[0], '')
  }

  return output
}

async function getIconsArray (config: IConfig): Promise<IIcon[]> {

  if (!config.fileId || !config.personalAccessToken) {
    throw new Error(
      `'FIGMA_ACCESS_TOKEN or FIGMA_FILE_ID not defined.\r\n'`
    );
  }

  console.log(`Fetching icon components information from Figma file ${config.fileId}...`)
  const client = Figma.Client({ personalAccessToken: config.personalAccessToken })

  const components = await client.file(config.fileId).then(({ data }) => {
    console.log(`  File name: ${data.name}`)
    console.log(`  Last modified: ${data.lastModified}`)

    const components = data.components
    const componentIds = Object.keys(components)
    let canvases = data.document.children.filter(node => node.type === 'CANVAS')
    if (config.pages && config.pages.length > 0) {
      canvases = canvases.filter(node => config.pages.includes(node.name))
    }
    const verifyFn = (node: Figma.Node) => componentIds.includes(node?.id)

    const groupedComponents = Object.fromEntries(canvases.map(canvas => [canvas.name, Collect({object: canvas, callback: verifyFn}).map(node => node.id)]))

    return Object.entries(groupedComponents)
      .map(([set, ids]) => ids.map(id => {
        const currentComponent = components[id]

        if (!currentComponent) {
          throw new Error(
            `Component ${id} is undefined`
          );
        }

        const output = {
          id,
          set: config.multipleSets ? set : undefined,
          ...currentComponent,
          ...getDataFromDescription(currentComponent.description)
        }

        return output
      }))
      .flat()
  })

  return await client.fileImages(config.fileId, {
    ids: components.map(component => component.id),
    format: 'svg',
    scale: 4
  }).then(({ data }) => components.map((component) => ({
    ...component,
    url: data.images[component.id]
  })))
}

async function fetchIconData (iconsList: IIcon[]) {
  console.log('Fetching icons svg data...')
  return await Promise.all(
    iconsList.map(async (icon) => {

      if (!icon.url) {
        throw new Error(
          `Icon ${icon.name} has undefined url`
        );
      }

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

async function writeIconsToSvg (iconsList: IIcon[], config: IConfig) {
  console.log('Writing svg icons data to files...')
  return await Promise.all(
    iconsList.map(async (icon) => {
      const filePath = config.multipleSets
        ? join(config.svgDir, kebabCase(icon.set), `${kebabCase(icon.name)}.svg`)
        : join(config.svgDir, `${kebabCase(icon.name)}.svg`)

        if (!icon.svg) {
          throw new Error(
            `Icon ${icon.name} has undefined svg`
          );
        }

      return await fs.outputFile(filePath, icon.svg).then(() => {
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

async function createWebFonts (iconsList: IIcon[], config: IConfig) {
  console.log('Writing font files...')
  console.log(`  Using formats: ${config.formats.join(', ')} \r\n`)

  const sets = config.multipleSets ? UniqueValues({array: iconsList, mapFn: item => item.set}) : ['']
  return await Promise.all(sets.map(async (set) => {
    const icons = config.multipleSets ? iconsList.filter(icon => icon.set === set) : iconsList
    const name = config.multipleSets ? `${config.fontName}-${set}` : config.fontName
    const inputDir = config.multipleSets ? resolve('.', config.svgDir, kebabCase(set)) : resolve('.', config.svgDir)
    const outputDir = resolve('.', config.fontsDir)
    const codepoints = Object.fromEntries(icons.filter(icon => !!icon.unicode).map(icon => {
      if (!icon.unicode) {
        throw new Error(
          `Unicode is undefined for icon ${icon.name}`
        );
      }
      return [kebabCase(icon.name), parseInt(icon.unicode, 16)]
    }))

    await fs.ensureDir(outputDir)

    return generateFonts({
      name,
      inputDir,
      outputDir,
      codepoints,
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

        if (!codepoint) {
          throw new Error(
            `Codepoint is undefined for icon ${icon.name}`
          );
        }

        if (!icon.path) {
          throw new Error(
            `Path is undefined for icon ${icon.name}`
          );
        }

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

async function writeGlyphsData (glyphsData: IGlyphData[], config: IConfig) {
  console.log('Writing glyph data...')
  const glyphsDataFilePath = resolve(config.dataDir, 'glyphs.json')
  if (config.multipleSets) {
    const sets = UniqueValues({array: glyphsData, mapFn: item => item.set})
    console.log(`  Writing data for ${glyphsData.length} icons in ${sets.length} sets`)
  } else {
    console.log(`  Writing data for ${glyphsData.length} icons in 1 set`)
  }

  await fs.outputJson(glyphsDataFilePath, glyphsData, { spaces: 2 }).then(() => {
    console.log(`  - glyphs data in file: ${glyphsDataFilePath}`)
    console.log('Done.\r\n')
  })
}

/**
 * @typedef {Object} IconsConfig
 * @property {string} personalAccessToken - personal access token for figma
 * @property {string} fileId - id of a figma file
 * @property {string[]} pages - names of the pages that are containing icons
 * @property {boolean} multipleSets - if multiple sets should be created. If true, then each page will be different set.
 * @property {string} distDir - main output directory
 * @property {string} svgDir - directory for svg files
 * @property {string} fontsDir - directory for font files
 * @property {string} dataDir - directory for JSON file
 * @property {string} docsDir - output file for icon docs
 * @property {string} fontName - name of the font
 * @property {array} formats - formats to be generated ('svg', 'ttf', 'woff', 'woff2', 'eot')as in th
 * @property {string} mainTemplate - path to handlebars template for docs
 * @property {string} docsPartials - glob to partials for tokens documentation
 * @property {object} meta - meta information for font files.
 * @property {string} meta.description - font files description
 * @property {string} meta.url - url for a font manufacturer
 * @property {string} meta.copyright - copyright information
 * @property {string} meta.version - font version number
 */

/**
 * @param {IconsConfig} config - config for icons generator
 * @returns {Promise<void>}
 */
export const Icons = async (config: IConfig) => {
  if (!config.fileId || !config.personalAccessToken) {
    console.error('Icons will not be generated, since token and figma file id were not found.')
    console.error('Please provide FIGMA_ACCESS_TOKEN and FIGMA_FILE_ID env variables or in .env file.\r\n')
    return
  }

  fs.removeSync(config.svgDir)
  fs.removeSync(config.dataDir)
  fs.removeSync(config.fontsDir)

  const iconsList = await getIconsArray(config)
  const iconsData = await fetchIconData(iconsList)
  const svgIcons = await writeIconsToSvg(iconsData, config)
  const glyphsData = await createWebFonts(svgIcons, config)

  const formattedGlyphsData = glyphsData.flat()
    .map((icon) => pick(icon, ['name', 'set', 'description', 'documentationLinks', 'path', 'codepoint', 'glyph', 'unicode']))
    .map((icon) => ({
      ...icon,
      name: icon.name
    }))

  await writeGlyphsData(formattedGlyphsData, config)

}
