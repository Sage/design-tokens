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
const iosBuildPath = "dist/ios/"

interface IMode {
  modeName?: string
  format: string
  suffix: string
  subPath?: string
}

interface IFiles extends IMode {
  componentName: string
  outputRefs?: boolean | ((token: DesignToken) => boolean)
  iosScope?: "common" | "themed"
}

const shouldOutputGlobalDepthRefsOnly = (token: DesignToken): boolean => {
  return token["path"]?.[0] === "global" && token["path"]?.[1] === "depth"
}

const isIOSSwiftToken = (token: DesignToken): boolean => {
  const original = token["original"]
  const type = original?.$type ?? original?.type ?? token.$type ?? token.type
  const value = original?.$value ?? original?.value ?? token.$value ?? token.value

  if (type === "color") {
    return typeof value === "string"
  }

  if (type === "typography") {
    return (token["path"] ?? []).join(".").indexOf(".font.fluid.") === -1
  }

  return [
    "dimension", "number", "borderWidth", "borderRadius", "sizing", "spacing",
    "typography", "boxShadow", "shadow", "fontFamilies", "fontFamily", "fontSizes", "fontSize",
    "fontWeights", "fontWeight", "lineHeights", "lineHeight", "opacity", "other", "paragraphSpacing", "txtDecoration",
  ].includes(type ?? "")
}

const iosClassName = (componentName: string, modeName = ""): string => {
  const mode = modeName.charAt(0).toUpperCase() + modeName.slice(1)
  const component = componentName.charAt(0).toUpperCase() + componentName.slice(1)

  if (componentName === "mode") {
    return `SageTokens${mode}`
  }

  if (modeName === "common") {
    return `SageTokens${component}`
  }

  return `SageTokens${mode}${component}`
}

const mergeIOSComponents = (sourcePath: string): void => {
  const componentPath = `${iosBuildPath}components/`

  fs.readdirSync(sourcePath).forEach((file) => {
    const destination = `${componentPath}${file}`
    const source = fs.readFileSync(`${sourcePath}${file}`, "utf-8")
      .replace(/^import UIKit\n+/m, "")

    fs.appendFileSync(destination, `\n${source}`)
  })
}

const getModeOnlyFiles = ({modeName = "", format, suffix, subPath}: IMode): File[] => {
  return getFiles({componentName: "mode", modeName, format, suffix, subPath})
}

const getComponentOnlyFiles = ({modeName = "", format, suffix, subPath, iosScope}: IMode & Pick<IFiles, "iosScope">): File[] => {
  const mode = format.includes("variables") ? "" : modeName

  const componentArray: File[] = []

  components.forEach((component) => {
    const componentName = component.split(".json")[0]

    if (!componentName) {
      throw new Error(
        `Component name not found for ${component}`)
    }

    componentArray.push(...getFiles({componentName, modeName: mode, format, suffix, outputRefs: true, subPath, iosScope}))
  })

  return componentArray
}

const getFormat = (format: string, outputRefs: boolean, componentName: string): string => {

  // outputRefs is true for mode and component files, false for global
  if (format === "json/flat" && outputRefs) {
    return "custom/json-with-refs";
  } else if (format === "javascript/es6" && !["mode", "dark", "light"].includes(componentName)) {
    // For component files, use custom ES6 format instead of standard
    return "custom/es6-with-refs";
  } else if (format === "javascript/module") {
    if (["global", "mode", "dark", "light"].includes(componentName)) {
      // For mode/global files we want to have similar export format to ES6 rather nested objects
      return "custom/commonjs-exports";
    } else {
      // For component files, use custom CommonJS format instead of standard
      return "custom/commonjs-with-refs";
    }
  }

  return format;
}

const getFiles = ({componentName, modeName = "", format, suffix, outputRefs = false, subPath, iosScope}: IFiles): File[] => {
const hasOutputRefs = Boolean(outputRefs);

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
  const actualFormat = getFormat(format, hasOutputRefs, componentName);
  const isIOSSwiftFormat = format === "custom/ios-swift-with-refs"

  return [
    {
      destination: `${path}.${suffix}`,
      filter: (token: DesignToken) => {
        if (!FilterComponent(token, componentName, format.includes("json")) ||
          (isIOSSwiftFormat && !isIOSSwiftToken(token))) {
          return false
        }

        if (!isIOSSwiftFormat || !iosScope) {
          return true
        }

        const type = token["original"]?.$type ?? token["original"]?.type ?? token.$type ?? token.type
        const isThemed = ["color", "boxShadow", "shadow"].includes(type ?? "")

        return iosScope === "themed" ? isThemed : !isThemed
      },
      format: actualFormat,
      options: {
        outputReferences: isIOSSwiftFormat ? !["global", "mode"].includes(componentName) : outputRefs,
        ...(isIOSSwiftFormat ? {
          className: iosClassName(componentName, modeName),
          modeName: componentName === "global" ? "adaptive" : modeName,
          showFileHeader: false,
        } : {})
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
          ...getFiles({componentName: "global", format: "css/variables", suffix: "css", outputRefs: shouldOutputGlobalDepthRefsOnly})
        ]
      },
      scss: {
        buildPath: "dist/scss/",
        transforms: groups.scss,
        files: [
          ...getFiles({componentName: "global", format: "scss/variables", suffix: "scss", outputRefs: shouldOutputGlobalDepthRefsOnly})
        ]
      },
      js: {
        buildPath: "dist/js/",
        transforms: groups.js,
        files: [
          ...getFiles({componentName: "global", format: "javascript/module", subPath: "common", suffix: "js", outputRefs: shouldOutputGlobalDepthRefsOnly}),
          ...getFiles({componentName: "global", format: "typescript/module-declarations", subPath: "common", suffix: "d.ts", outputRefs: shouldOutputGlobalDepthRefsOnly}),
          ...getFiles({componentName: "global", format: "javascript/es6", subPath: "es6", suffix: "js", outputRefs: shouldOutputGlobalDepthRefsOnly}),
          ...getFiles({componentName: "global", format: "typescript/es6-declarations", subPath: "es6", suffix: "d.ts", outputRefs: shouldOutputGlobalDepthRefsOnly}),
        ]
      },
      json: {
        buildPath: "dist/json/",
        transforms: groups.json,
        files: [
          ...getFiles({componentName: "global", format: "json/flat", suffix: "json", outputRefs: shouldOutputGlobalDepthRefsOnly})
        ]
      },
      ios: {
        buildPath: iosBuildPath,
        basePxFontSize: 1,
        transforms: groups.ios,
        files: [
          ...getFiles({componentName: "global", format: "custom/ios-swift-with-refs", suffix: "swift"})
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
      },
      ios: {
        buildPath: iosBuildPath,
        basePxFontSize: 1,
        transforms: groups.ios,
        files: [
          ...getModeOnlyFiles({modeName, format: "custom/ios-swift-with-refs", suffix: "swift"})
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

const getComponentConfig = (modeName: string, iosScope: "common" | "themed" = "themed"): Config => {
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
      },
      ios: {
        buildPath: iosBuildPath,
        basePxFontSize: 1,
        transforms: groups.ios,
        files: [
          ...getComponentOnlyFiles({
            modeName: iosScope === "common" ? "common" : modeName,
            format: "custom/ios-swift-with-refs",
            suffix: "swift",
            subPath: iosScope === "common" ? "common" : modeName === "dark" ? modeName : undefined,
            iosScope,
          })
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
  await modeStyleDictionary.buildPlatform("ios")
}

// Phase 2: Build global tokens (shadow tokens reference mode tokens)
const globalStyleDictionary = new StyleDictionary(getGlobalConfig())

await globalStyleDictionary.buildPlatform("css")
await globalStyleDictionary.buildPlatform("scss")
await globalStyleDictionary.buildPlatform("js")
await globalStyleDictionary.buildPlatform("json")
await globalStyleDictionary.buildPlatform("ios")

// Phase 3: Build component tokens per mode.
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
  await componentStyleDictionary.buildPlatform("ios")
}

const commonComponentStyleDictionary = new StyleDictionary(getComponentConfig("light", "common"))

await commonComponentStyleDictionary.buildPlatform("ios")

mergeIOSComponents(`${iosBuildPath}common/components/`)
mergeIOSComponents(`${iosBuildPath}dark/components/`)
fs.rmSync(`${iosBuildPath}common`, { recursive: true })
fs.rmSync(`${iosBuildPath}dark`, { recursive: true })