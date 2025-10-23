/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

import * as fs from "fs"
import { StyleDictionary, groups } from "./style-dictionary.js"
import { DesignToken, File } from "style-dictionary/types"
import { FilterComponent } from "./utils/filter-component.js"
import { Config } from "style-dictionary"

const components = fs.readdirSync("./data/tokens/components/")
const modes = fs.readdirSync("./data/tokens/mode/")

interface IMode {
  modeName?: string
  format: string
  suffix: string
  subPath?: string
}

interface IFiles extends IMode {
  componentName: string
  outputRefs?: boolean
}

const getMode = ({modeName = "", format, suffix, subPath}: IMode): File[] => {
  const mode = format.includes("variables") ? "" : modeName

  const componentArray: File[] = []

  components.forEach((component) => {
    const componentName = component.split(".json")[0]

    if (!componentName) {
      throw new Error(
        `Component name not found for ${component}`)
    }

    componentArray.push(...getFiles({componentName, modeName: mode, format, suffix, outputRefs: true, subPath}))
  })
  
  return [
    ...getFiles({componentName: "mode", modeName, format, suffix, subPath}),
    ...componentArray
  ]
}

const getFormat = (format: string, outputRefs: boolean, componentName: string): string => {
  // outputRefs is true for mode and component files, false for global
  if (format === "json/flat" && outputRefs) {
    return "custom/json-with-refs";
  } else if (format === "javascript/es6" && !["mode", "global", "dark", "light"].includes(componentName)) {
    // For component files, use custom ES6 format instead of standard
    return "custom/es6-with-refs";
  } else if (format === "javascript/module") {
    if (["mode", "global", "dark", "light"].includes(componentName)) {
      // For mode/global files we want to have similar export format to ES6 rather nested objects
      return "custom/commonjs-exports";
    } else {
      // For component files, use custom CommonJS format instead of standard
      return "custom/commonjs-with-refs";
    }
  }

  return format;
}

const getFiles = ({componentName, modeName = "", format, suffix, outputRefs = false, subPath}: IFiles): File[] => {
  const getPath = (componentName: string) => {
    let path = ""

    switch(componentName) {
      case "mode":
        path = modeName;
        break
      case "global":
        path = "global";
        break
      default:
        path = `components/${componentName}`;
    }

    if (subPath) {
      path = subPath + (path ? `/${path}` : "");
    }

    return path
  }

  const path = getPath(componentName).trim()
  const actualFormat = getFormat(format, outputRefs, componentName);

  return [
    {
      destination: `${path}.${suffix}`,
      filter: (token: DesignToken) => FilterComponent(token, componentName, format.includes("json")),
      format: actualFormat,
      options: {
        outputReferences: outputRefs
      }
    }
  ]
}

const getGlobalConfig = (): Config => {
  return {
    source: [
      "./data/tokens/core.json",
      "./data/tokens/global/*.json"
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        buildPath: "dist/css/",
        transforms: groups.css,
        files: [
          ...getFiles({componentName: "global", format: "css/variables", suffix: "css"})
        ]
      },
      scss: {
        buildPath: "dist/scss/",
        transforms: groups.scss,
        files: [
          ...getFiles({componentName: "global", format: "scss/variables", suffix: "scss"})
        ]
      },
      js: {
        buildPath: "dist/js/",
        transforms: groups.js,
        files: [
          ...getFiles({componentName: "global", format: "javascript/module", subPath: "common", suffix: "js"}),
          ...getFiles({componentName: "global", format: "typescript/module-declarations", subPath: "common", suffix: "d.ts"}),          
          ...getFiles({componentName: "global", format: "javascript/es6", subPath: "es6", suffix: "js"}),
          ...getFiles({componentName: "global", format: "typescript/es6-declarations", subPath: "es6", suffix: "d.ts"}),          
        ]
      },
      json: {
        buildPath: "dist/json/",
        transforms: groups.json,
        files: [
          ...getFiles({componentName: "global", format: "json/flat", suffix: "json"})
        ]
      }
    },
    log: {
      warnings: "warn" as const,
      verbosity: "verbose" as const,
      errors: {
        brokenReferences: "throw" as const,
      },
    },
  }
}

const getModeConfig = (modeName: string): Config => {
  return {
    source: [
      "./data/tokens/core.json",
      "./data/tokens/global/*.json",
      `./data/tokens/mode/${modeName}.json`,
      "./data/tokens/components/*.json"
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        buildPath: "dist/css/",
        transforms: groups.css,
        files: [
          ...getMode({modeName, format: "css/variables", suffix: "css"})
        ]
      },
      scss: {
        buildPath: "dist/scss/",
        transforms: groups.scss,
        files: [
          ...getMode({modeName, format: "scss/variables", suffix: "scss"})
        ]
      },
      js: {
        buildPath: "dist/js/",
        transforms: groups.js,
        files: [
          ...getMode({modeName, format: "javascript/module", subPath: "common", suffix: "js"}),
          ...getMode({modeName, format: "typescript/module-declarations", subPath: "common", suffix: "d.ts"}),
          ...getMode({modeName, format: "javascript/es6", subPath: "es6", suffix: "js"}),
          ...getMode({modeName, format: "typescript/es6-declarations", subPath: "es6", suffix: "d.ts"}),
        ]
      },
      json: {
        buildPath: "dist/json/",
        transforms: groups.json,
        files: [
          ...getMode({modeName, format: "json/flat", suffix: "json"})
        ]
      }
    },
    log: {
      warnings: "warn" as const,
      verbosity: "verbose" as const,
      errors: {
        brokenReferences: "throw" as const,
      },
    },
  }
}

// Build global tokens
const globalStyleDictionary = new StyleDictionary(getGlobalConfig())

await globalStyleDictionary.buildPlatform("css")
await globalStyleDictionary.buildPlatform("scss")
await globalStyleDictionary.buildPlatform("js")
await globalStyleDictionary.buildPlatform("json")

// Build mode-specific tokens
modes.forEach(async (mode) => {
  const modeName = mode.split(".json")[0]

  if (!modeName) {
    throw new Error(
      `Mode name not found for ${mode}`)
  }

  const modeStyleDictionary = new StyleDictionary(getModeConfig(modeName))

  await modeStyleDictionary.buildPlatform("css")
  await modeStyleDictionary.buildPlatform("scss")
  await modeStyleDictionary.buildPlatform("js")
  await modeStyleDictionary.buildPlatform("json")
});
