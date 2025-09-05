/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */
import path, { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import fs from "fs-extra"
import camelCase from "lodash/camelCase.js"
import pick from "lodash/pick.js"
import { FontAssetType } from "fantasticon"
import { sync } from "glob"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { FileName } from "./utils/filename.js"
import { HeaderContents } from "./utils/file-header.js"

import { Icons } from "./icons.js"

dotenv.config()

function copyPackageJSON () {
  try {
    const packageDef = fs.readJsonSync(resolve(__dirname, "../package.json"))
    const filteredPackageDef = pick(
      packageDef,
      ["name", "dependencies", "repository", "description", "author", "version", "peerDependencies", "license", "tags"]
    )

    // Writes to package.json in dist
    fs.outputJsonSync(
      resolve(__dirname, "../dist/package.json"),
      filteredPackageDef,
      {
        spaces: 2
      }
    )
  } catch (err) {
    console.log("Error copying package.json")
    console.log(err)
  }
}

function copyReadme () {
  try {
    fs.copySync(
      resolve(__dirname, "../README.md"),
      resolve(__dirname, "../dist/README.md")
    )
  } catch (err) {
    console.log("Error copying readme to dist")
    console.log(err)
  }
}

function addCommonJSEntryFile () {
  const jsFilePaths = sync("./dist/js/common/*.js")
  const jsComponentPaths = sync("./dist/js/common/components/*.js")
  const entryFilePath = resolve(__dirname, "../dist/js/common/index.js")

  const fileRequires = jsFilePaths
    .map((filePath: string) => {
      const pathParts = filePath.split("/")
      const fullName = pathParts[pathParts.length - 1]
      const name = FileName(fullName)

      return `const ${camelCase(name)} = require("./${name}.js");`
    }
    ).join("\n")

  const componentRequires = jsComponentPaths
    .map((filePath: string) => {
      const pathParts = filePath.split("/")
      const fullName = pathParts[pathParts.length - 1]
      const component = FileName(fullName)

      return `const ${camelCase(component)} = require("./components/${component}.js");`
    }).join("\n")

  const fileExports = jsFilePaths
    .map((filePath: string) => {
      const pathParts = filePath.split("/")
      const fullName = pathParts[pathParts.length - 1]
      const name = FileName(fullName)

      return `  ${camelCase(name)},`
    }).join("\n")

  const componentExports = jsComponentPaths
    .map((filePath: string) => {
      const pathParts = filePath.split("/")
      const fullName = pathParts[pathParts.length - 1]
      const component = FileName(fullName)

      return `  ${camelCase(component)},`
    }).join("\n")

    const entryContent = [
      "// Main commonJS token requires",
      fileRequires,
      "",
      "// Component commonJS token requires",
      componentRequires,
      "",
      "module.exports = {",
      fileExports,
      componentExports,
      "};"
    ].join("\n")

  fs.outputFileSync(entryFilePath, entryContent)
}

function addES6EntryFiles () {
  const jsFilePaths = sync("./dist/js/ES6/*.js")
  const jsComponentPaths = sync("./dist/js/ES6/components/*.js")
  const entryFilePath = resolve(__dirname, "../dist/js/ES6/index.js")

  const fileExports = jsFilePaths
    .map((filePath: string) => {
      const pathParts = filePath.split("/")
      const fullName = pathParts[pathParts.length - 1]
      const name = FileName(fullName)

      return `export * as ${camelCase(name)} from "./${name}.js"`
    }).join("\n")

  const componentExports = jsComponentPaths
    .map((filePath: string) => {
      const pathParts = filePath.split("/")
      const fullName = pathParts[pathParts.length - 1]
      const component = FileName(fullName)

      return `export * as ${camelCase(component)} from "./components/${component}.js"`
    }).join("\n")

  const entryContent = [
    "// Main ES6 token exports",
    fileExports,
    "",
    "// Component ES6 token exports",
    componentExports,
    ""
  ].join("\n")

  fs.outputFileSync(entryFilePath, entryContent)
}

function addSCSSEntryFile() {
  const scssFiles = sync("./dist/scss/*.scss");
  const scssComponentFiles = sync("./dist/scss/components/*.scss");
  const indexPath = resolve(__dirname, "../dist/scss/all.scss");

  const forwards = [
    ...scssFiles
      .map(file => {
        const name = path.basename(file, ".scss");
        return `@forward "./${name}";`;
      }),
    ...scssComponentFiles.map(file => {
      const name = path.basename(file, ".scss");
      return `@forward "./components/${name}";`;
    })
  ].join("\n");

  fs.outputFileSync(indexPath, forwards);
}

function addFileHeader () {
  const files = sync("dist/**/*.@(css|js|ts|d.ts|scss|less)")
  files.forEach((file: string) => {
    try {
      const filePath = resolve(__dirname, "../", file)
      const outputData = HeaderContents() + "\r\n\r\n" + fs.readFileSync(filePath)

      fs.outputFileSync(filePath, outputData)
    } catch (er) {
      console.error(`Error adding header to ${file}`, er)
    }
  })
}

function copyAssets () {
  try {
    fs.copySync(
      resolve(__dirname, "../assets"),
      resolve(__dirname, "../dist/assets/")
    )
  } catch (err) {
    console.log("Error copying assets to dist")
    console.log(err)
  }
}

(async () => {
  copyPackageJSON()
  copyReadme()
  copyAssets()
  addCommonJSEntryFile()
  addES6EntryFiles()
  addSCSSEntryFile()
  addFileHeader()
  await Icons({
    personalAccessToken: process.env["FIGMA_ACCESS_TOKEN"],
    fileId: process.env["FIGMA_FILE_ID"],
    pages: ["Icons"],
    multipleSets: false,
    distDir: "./dist",
    svgDir: "./dist/assets/icons/svg",
    fontsDir: "./dist/assets/icons/fonts",
    dataDir: "./dist/assets/icons/data",
    fontName: "sage-icons",
    formats: [FontAssetType.SVG, FontAssetType.WOFF, FontAssetType.WOFF2, FontAssetType.TTF, FontAssetType.EOT],
    mainTemplate: "./templates/layout.hbs",
    docsDir: "./dist/docs/icons/",
    docsPartials: "./templates/partials/**/*.hbs",
    meta: {
      description: "Sage Icon Font",
      url: "http://sage.com",
      copyright: "Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved.",
      version: "1.0"
    }
  })
})()
