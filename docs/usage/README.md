# Usage
The tokens are distributed in a number of different formats:
- android
- css
- ios
- js
- json
- scss

There is also an assets directory distributed for any physical files that are common across any of the above formats.

Most of these formats distribute tokens exactly as provided to the build process and can therefore be used by consuming tools and processes accordingly. Any exceptions to this are listed below.

## CSS
Due to the nature of CSS and the requirement for browsers to consume styles directly an additional all.css file has been exposed in addition to the standard files provided that match other formats. This all.css file provides the following features:

- Media query for large screen tokens
- Consolidation to remove any large screen tokens which are included and unchanged in the default small screen token set
- Formatter to rename light/dark mode token to add a suffix and include the light-dark function where ever used. This will allow consumers to switch to light/dark mode (or device specified) on a page or section level using the [`color-scheme`](https://web.dev/articles/light-dark) css property.

See the associated index.html files provided in each of the distributed brand directories for examples over how these tokens may be consumed.

NOTE: Whilst there is good browser support for the [light-dark function](https://caniuse.com/?search=light-dark), you may want to use the [`postcss-preset-env`](https://www.npmjs.com/package/postcss-preset-env) postcss plugin alongside a [`.browserslistrc`](https://github.com/browserslist/browserslist) file to enhance support to the browsers required.