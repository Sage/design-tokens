# Sage Design Tokens

This repository contains the design tokens from the Sage Design System. These are generated using Stratos from a Sketch library maintained by the design system team. The Design Token library is designed to be a platform agnostic tool to align all our products with the Design System.

## Using the design tokens

_COMING SOON_

### Web

To make use of these tokens in your application, import the correct variable definitions based on your styling technology.

#### CSS

To make use of the css variables, import them into your code like so:
```css
/* Inside css */
@import '~@Sage/design-tokens/css/_variables.css';
```
```js
// For projects where you can import css files into JS
import '@Sage/design-tokens/css/_variables.css';
```

This will add the variables to the root element of the page.

#### SCSS

To make use of the scss variables, import them into your scss files like so:
```scss
@use '~@Sage/design-tokens/scss/_variables.scss';
```

You can also use `@import`, but for scss this is [being deprecated](https://sass-lang.com/documentation/at-rules/import) in favour of `@use`;

#### LESS

To make use of the less variables, import them into your less files like so:
```less
@import (reference) '~@Sage/design-tokens/less/_variables.less';
```

#### CSS-in-JS

The js variables are exported in PascalCase, rather than dash seperated in the design system portal.

To import all of the tokens, you can do so like so:

```js
import * as SageDesignTokens from '@sage/design-tokens';
```

To import a single token, such as `colors-text-black-90`, import it like so:
```js
import { ColorsTextBlack90 } from '@sage/design-tokens';
```

A type definition file is also included to work in projects with typescript installed.

### iOS

_COMING SOON_

### Android

_COMING SOON_

## Development

Instructions on how to develop this library.

### Prerequisites

You will need to have node and npm installed on your system.

It is recommended that you also install these npm libraries globally:
```bash
npm install --global style-dictionary less sass
```

### Build

To build this package for web, run this command:

```bash
npm run build:web
```

### Publish

_COMING SOON_

## Contributing

The Sage Design team welcomes any suggestions for updates to this repository. Please open an issue to discuss your proposal before opening a pull request.

The values in data are exported from a design file which is the source of truth for the design tokens. We will not accept PR that have manually changed these values, although we welcome any suggestions you may have.

# Licence

Internal

_COMING SOON_