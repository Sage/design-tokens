# Usage

The tokens are distributed in a number of different formats:

- css
- js
- json
- scss

There is also an assets directory distributed for any physical files that are common across any of the above formats.

Most of these formats distribute tokens exactly as provided to the build process and can therefore be used by consuming tools and processes accordingly. Any exceptions to this are listed below.

## CSS

Due to the nature of CSS and the requirement for browsers to consume styles directly an additional all.css file has been exposed in addition to the standard files provided that match other formats. This all.css file provides the following features:

- Media query for applying dark mode tokens
- Support for consumers switching to light/dark mode (or device specified) on a page or section level using the [`color-scheme`](https://web.dev/articles/light-dark) css property.

See the associated index.html files provided in each of the distributed context directories for examples over how these tokens may be consumed.
