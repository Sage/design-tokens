# Sage Design Tokens

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

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
@use '~@sage/design-tokens/scss/_variables.scss';
```

You can also use `@import`, but for scss this is [being deprecated](https://sass-lang.com/documentation/at-rules/import) in favour of `@use`;

#### LESS

To make use of the less variables, import them into your less files like so:
```less
@import (reference) '~@sage/design-tokens/less/_variables.less';
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

## Contributing

If you would like to help contribute to this library, please read our [contributing documentation](./docs/CONTRIBUTING.md),

## Licence

Licensed under the Apache License, Version 2.0 (the "License");
you may not use these files except in compliance with the License.
You may obtain a copy of the License at [Apache 2.0 license](./license).

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Repository maintainer

[Mark Mizen, User Experience Engineer](mailto:mark.mizen@sage.com).


Copyright (c) 2021 Sage Group Plc. All rights reserved.