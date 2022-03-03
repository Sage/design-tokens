# Design Tokens Documentation

File: `./scripts/tokens-documentation.js`

```bash
$ node ./scripts/tokens-documentation
```

```js
// script is executed on require, since it uses IIFE
require('./scripts/tokens-documentation')
```

## Disclaimer
Tokens documentation script generates documentation for all design tokens. It's necessary for documentation to be generated based on exat the same token names and values as the actual available ones in the library. That is why it uses style dictionary engine and our transforms underneath. Transformed data is then passed to the Handlebars engine and is transformed to proper HTML files.

There are multiple files with different grouping of the tokens.
- General listing (`dist/docs/tokens/index.html`) - lists all available themes, categories and tokens.  
- Theme listing (`dist/docs/tokens/<theme>/index.html`) - lists all categories and tokens in given theme.
- Category listing (`dist/docs/tokens/<theme>/<category>/index.html`) - lists all tokens in given category in given theme.

Splitting documentation in separate files was introduced to help with embedding this documentation into iframes.

There is also possible to add `?embedded=true` in address bar in web browser. This hides all unnecessary elements in the documentation.

## Config

| Name | Description |
|---|---|
| mainTemplate | Path to main template for documentation |
| docsPartials | Glob to partials for tokens documentation |  
| docsDir | Output dir for generated documentation |
