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
  outputRefs?: boolean | ((token: DesignToken) => boolean)
}

const getModeOnlyFiles = ({modeName = "", format, suffix, subPath}: IMode): File[] => {
  return getFiles({componentName: "mode", modeName, format, suffix, subPath})
}

const getComponentOnlyFiles = ({modeName = "", format, suffix, subPath}: IMode): File[] => {
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

  return componentArray
}

const getFormat = (format: string, outputRefs: boolean | ((token: DesignToken) => boolean) = false, componentName: string): string => {
  const hasRefs = typeof outputRefs === "function" ? true : outputRefs;
  // outputRefs is true for mode and component files, false for global
  if (format === "json/flat" && hasRefs) {
    return "custom/json-with-refs";
  } else if (format === "javascript/es6" && (hasRefs || !["mode", "global", "dark", "light"].includes(componentName))) {
    return "custom/es6-with-refs";
  } else if (format === "javascript/module") {
    if (["mode", "global", "dark", "light"].includes(componentName)) {
      return "custom/commonjs-exports";
    } else {
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
        outputReferences: typeof outputRefs === "function" ? outputRefs : outputRefs
      }
    }
  ]
}

const getGlobalConfig = (): Config => {
  return {
    source: [
      "./data/tokens/core.json",
      "./data/tokens/mode/*.json",
      "./data/tokens/global/*.json"
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        buildPath: "dist/css/",
        transforms: groups.css,
        files: [
          ...getFiles({componentName: "global", format: "css/variables", suffix: "css", outputRefs: (token: DesignToken) => token.path[1] === 'depth'})
        ]
      },
      scss: {
        buildPath: "dist/scss/",
        transforms: groups.scss,
        files: [
          ...getFiles({componentName: "global", format: "scss/variables", suffix: "scss", outputRefs: (token: DesignToken) => token.path[1] === 'depth'})
        ]
      },
      js: {
        buildPath: "dist/js/",
        transforms: groups.js,
        files: [
          ...getFiles({componentName: "global", format: "javascript/module", subPath: "common", suffix: "js", outputRefs: (token: DesignToken) => token.path[1] === 'depth'}),
          ...getFiles({componentName: "global", format: "typescript/module-declarations", subPath: "common", suffix: "d.ts", outputRefs: (token: DesignToken) => token.path[1] === 'depth'}),
          ...getFiles({componentName: "global", format: "javascript/es6", subPath: "es6", suffix: "js", outputRefs: (token: DesignToken) => token.path[1] === 'depth'}),
          ...getFiles({componentName: "global", format: "typescript/es6-declarations", subPath: "es6", suffix: "d.ts", outputRefs: (token: DesignToken) => token.path[1] === 'depth'}),
        ]
      },
      json: {
        buildPath: "dist/json/",
        transforms: groups.json,
        files: [
          ...getFiles({componentName: "global", format: "json/flat", suffix: "json", outputRefs: (token: DesignToken) => token.path[1] === 'depth'})
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

const getModeOnlyConfig = (modeName: string): Config => {
  return {
    source: [
      "./data/tokens/core.json",
      "./data/tokens/global/*.json",
      `./data/tokens/mode/${modeName}.json`
    ],
    preprocessors: ["tokens-studio"],
    platforms: {
      css: {
        buildPath: "dist/css/",
        transforms: groups.css,
        files: [
          ...getModeOnlyFiles({modeName, format: "css/variables", suffix: "css"})
        ]
      },
      scss: {
        buildPath: "dist/scss/",
        transforms: groups.scss,
        files: [
          ...getModeOnlyFiles({modeName, format: "scss/variables", suffix: "scss"})
        ]
      },
      js: {
        buildPath: "dist/js/",
        transforms: groups.js,
        files: [
          ...getModeOnlyFiles({modeName, format: "javascript/module", subPath: "common", suffix: "js"}),
          ...getModeOnlyFiles({modeName, format: "typescript/module-declarations", subPath: "common", suffix: "d.ts"}),
          ...getModeOnlyFiles({modeName, format: "javascript/es6", subPath: "es6", suffix: "js"}),
          ...getModeOnlyFiles({modeName, format: "typescript/es6-declarations", subPath: "es6", suffix: "d.ts"}),
        ]
      },
      json: {
        buildPath: "dist/json/",
        transforms: groups.json,
        files: [
          ...getModeOnlyFiles({modeName, format: "json/flat", suffix: "json"})
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

const getComponentConfig = (modeName: string): Config => {
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
          ...getComponentOnlyFiles({modeName, format: "css/variables", suffix: "css"})
        ]
      },
      scss: {
        buildPath: "dist/scss/",
        transforms: groups.scss,
        files: [
          ...getComponentOnlyFiles({modeName, format: "scss/variables", suffix: "scss"})
        ]
      },
      js: {
        buildPath: "dist/js/",
        transforms: groups.js,
        files: [
          ...getComponentOnlyFiles({modeName, format: "javascript/module", subPath: "common", suffix: "js"}),
          ...getComponentOnlyFiles({modeName, format: "typescript/module-declarations", subPath: "common", suffix: "d.ts"}),
          ...getComponentOnlyFiles({modeName, format: "javascript/es6", subPath: "es6", suffix: "js"}),
          ...getComponentOnlyFiles({modeName, format: "typescript/es6-declarations", subPath: "es6", suffix: "d.ts"}),
        ]
      },
      json: {
        buildPath: "dist/json/",
        transforms: groups.json,
        files: [
          ...getComponentOnlyFiles({modeName, format: "json/flat", suffix: "json"})
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

// Phase 1: Build mode tokens first (no dependencies on global)
for (const mode of modes) {
  const modeName = mode.split(".json")[0]

  if (!modeName) {
    throw new Error(`Mode name not found for ${mode}`)
  }

  const modeStyleDictionary = new StyleDictionary(getModeOnlyConfig(modeName))

  await modeStyleDictionary.buildPlatform("css")
  await modeStyleDictionary.buildPlatform("scss")
  await modeStyleDictionary.buildPlatform("js")
  await modeStyleDictionary.buildPlatform("json")
}

// Phase 2: Build global tokens (shadow tokens reference mode tokens)
const globalStyleDictionary = new StyleDictionary(getGlobalConfig())

await globalStyleDictionary.buildPlatform("css")
await globalStyleDictionary.buildPlatform("scss")
await globalStyleDictionary.buildPlatform("js")
await globalStyleDictionary.buildPlatform("json")

// Phase 3: Build component tokens per mode
for (const mode of modes) {
  const modeName = mode.split(".json")[0]

  if (!modeName) {
    throw new Error(`Mode name not found for ${mode}`)
  }

  const componentStyleDictionary = new StyleDictionary(getComponentConfig(modeName))

  await componentStyleDictionary.buildPlatform("css")
  await componentStyleDictionary.buildPlatform("scss")
  await componentStyleDictionary.buildPlatform("js")
  await componentStyleDictionary.buildPlatform("json")
}
