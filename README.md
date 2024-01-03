# Sage Design Tokens

[![GitHub release](https://img.shields.io/github/release/Sage/design-tokens.svg)](https://GitHub.com/Sage/design-tokens/releases/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Sage/design-tokens/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

This repository contains the design tokens from the Sage Design System. These are maintained by the Sage DS team. This library is for distributing these tokens across multiple platforms.

## What are design tokens?

Design Tokens are Design System’s most basic, lowest level element. In atomic design terminology those would be the protons or electrons.

Basically those are **key-value records named and organized the same way regardless of the platform** (e.g. web, Android, iOS, Figma). They can define various properties, such as colors, paddings, margins, sizes, font sizes, font families, transitions, animations, and others. **They represent certain design decisions.**

Design tokens purpose is to:
- **Release developers from taking design decisions.** Often while developing a component, developer needs to take decision what tint of what color should be used. This decision should be taken by designer, not developer.
- **Improve handover process and communication between designers and developers.** Both, developers and designers are going to use the same token name for given property (color, background color, border, padding, margin, transition and so on). In the end, developers don't need to know what the final value will be.
- **Narrow value set to only needed values.** Design System uses narrow set of values (spacings, colors, typography properties and others). Those are only values that are needed for visual description of the component.
- **Keep visual consistency across all components of the library.**

## Docs:
- [Figma tokens github workflow](./docs/figma-github-workflow.md)
- [Pre-transform phase](./docs/pretransform-phase.md)
- [Generating icons](./docs/icons.md)
- [Generating tokens documentation](./docs/tokens-documentation.md)

## Using the design tokens

### Web

To make use of these tokens in your application, import the correct variable definitions based on your styling technology.

#### Install

To add to a project using npm:

```bash
# If you're using npm:
npm install --save @sage/design-tokens

# OR If you're using yarn:
yarn add @sage/design-tokens
```

You can also add the files directly by downloading from the [releases page on Github](https://github.com/Sage/design-tokens/releases).

#### CSS

To make use of the css variables, import them into your code like so:

```css
/* Inside css */
@import "~@sage/design-tokens/css/<theme>.css";
```

```js
// For projects where you can import css files into JS
import "@sage/design-tokens/css/<theme>.css";
```

This will add the variables to the root element of the page.

#### SCSS

To make use of the scss variables, import them into your scss files like so:

```scss
@use '~@sage/design-tokens/scss/<theme>.scss';
```

You can also use `@import`, but for scss this is [being deprecated](https://sass-lang.com/documentation/at-rules/import) in favour of `@use`;

#### Common JS module

```js
const tokens = require('@sage/design-tokens/js/<theme>/common')

// Then use in code:
element.style.color = tokens.colorsBase500
```

#### ES6 module

```js
import tokens from "@sage/design-tokens/js/<theme>/es6";

// Then use in code:
element.style.color = tokens.colorsBase500
```

A type definition file is also included to work in projects with typescript installed.

#### Other formats

It is possible to export design tokens to any format or language. If you need to use design tokens in your technology, please contact us and describe your needs.

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

Copyright (c) 2024 Sage Group Plc. All rights reserved.
