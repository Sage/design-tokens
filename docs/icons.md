# Icons

File: `./scripts/icons.js`

```bash
$ node ./scripts/icons
```

```js
// script is executed on require, since it uses IIFE
require('./scripts/icons')
```

## Disclaimer
Purpose of this tool is to delegate whole responsibility for the icons to the designers, and to speed up and facilitate the whole font creation process. They will maintain icons inside specified Figma file, and then

Icons script uses Figma API to request given file, and fetch all Icons Data - their name, preferred unicode, set as well as svg icons. They are then placed in a directory given in a config. Downloaded files are finally used to generate webfont file(s). In the end, all the data is saved to JSON file and documentation for icons is generated. 

## Running
In order to run icons fetch, you need to provide `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_ID` environmental variables. You can specify them in `.env` file since library utilizes `dotenv`.

- `FIGMA_ACCESS_TOKEN` - personal access token. Check out [official API docs](https://www.figma.com/developers/api#access-tokens) on how to get your token.
- `FIGMA_FILE_ID` - is a random alphanumeric string in url, like so: `https://www.figma.com/file/<FIGMA FILE ID>/Icons`

## Figma file structure
Each icon has to be a component in Figma. Component's name will be transformed to kebabCase and will be final icon name. Component Names have to be unique.
You can provide additional information in Figma component's description field:
- **preferred unicode** - this will assign given unicode to given icon in final font file. To consume this feature, add `code: <four-char-unicode>` at the beginning of your description 
- **search keywords** - to help find the best icon in the documentation. To use this feature, specify all keywords separated with coma.

### Sample description with preferred unicode and keywords:
```
code: f104
mail, envelope, letter, package, parcel, send
```

```
code: f120
heart, love, favorites, fave, like
```



## Config
| Property name | Description |
|---|---|
| personalAccessToken | personal access token for figma |
| fileId | id of a figma file |
| pages | names of the pages that are containing icons |
| multipleSets | if multiple sets should be created. If true, then each page will be different set. |
| distDir | main output directory |
| svgDir | directory for svg files |
| fontsDir | directory for font files |
| dataDir | directory for JSON file |
| docsDir | output file for icon docs |
| fontName | name of the font |
| formats | formats to be generated ('svg', 'ttf', 'woff', 'woff2', 'eot') |
| mainTemplate | path to handlebars template for docs |
| meta | meta information for font files |
| docsPartials | Glob to partials directory for documentation |
| meta | meta data for font file |
| meta.description | font files description |
| meta.url | url for a font manufacturer |
| meta.copyright | copyright information |
| meta.version | font version number |


