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
- [Generating icons](./docs/icons.md)

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
@import url("@sage/design-tokens/css/light.css");
@import url("@sage/design-tokens/css/dark.css") (prefers-color-scheme: dark);
@import url("@sage/design-tokens/css/components/button.css");
```

Alternatively, if you prefer to import all light mode tokens in a single file, you can use `light-all.css`:

```css
@import url("@sage/design-tokens/css/light-all.css");
```

**Note:** For manual theme switching in JavaScript applications, we recommend using the HTML `<link>` approach rather than dynamic imports to avoid bundler complexity. You can import the component css files in your JS like below.

```js
import "@sage/design-tokens/css/components/button.css";
```

```html
<link rel="stylesheet" href="node_modules/@sage/design-tokens/css/light.css" id="app-theme">

<script type="text/javascript">
  function switchTheme(theme) {
    document.getElementById('app-theme').href =
      `node_modules/@sage/design-tokens/css/${theme}.css`;
  }

  function updateTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    switchTheme(prefersDark ? "dark" : "light");
  }

  // Listen for system preference changes
  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateTheme);

  // Set initial theme on content load
  document.addEventListener("DOMContentLoaded", updateTheme);
</script>
```

#### SCSS

The SCSS format provides traditional Sass variables while handling mode switching through separate mode files. Due to variable naming conventions, loading both `light` and `dark` modes simultaneously would cause conflicts. To address this, dedicated mode files are provided.

##### Available Files

- Individual component files (e.g., `button.scss`, `container.scss`) - Available for granular imports
- The `global`, `light` and `dark` tokens are also exported in their own files for granularity as well

**Note:** The current SCSS output requires the use of `@import` statements to ensure variables are properly scoped across files. While `@import` will be deprecated when Dart Sass 3.0.0 is released, we will endeavor to update our output format to support the modern `@use` module system before that release.

To suppress deprecation warnings during compilation, add the `--silence-deprecation=import` flag to your Sass build command.

##### Light and Dark Mode Support with Granular Imports

Import specific components when you only need certain tokens and create separate CSS files for each mode:

```scss
// button-light.scss
@import "@sage/design-tokens/scss/global.scss";
@import "@sage/design-tokens/scss/light.scss";
@import "@sage/design-tokens/scss/components/button.scss";

.button-destructive-primary {
  background-color: $button-destructive-primary-bg-default;

  &:hover {
    background-color: $button-destructive-primary-bg-hover;
  }
}
```

```scss
// button-dark.scss
@import "@sage/design-tokens/scss/global.scss";
@import "@sage/design-tokens/scss/dark.scss";
@import "@sage/design-tokens/scss/components/button.scss";

.button-destructive-primary {
  background-color: $button-destructive-primary-bg-default;

  &:hover {
    background-color: $button-destructive-primary-bg-hover;
  }
}
```

Build process:
```bash
sass button-light.scss:button-light.css --no-source-map --silence-deprecation=import

sass button-dark.scss:button-dark.css --no-source-map --silence-deprecation=import
```

#### Common JS module

```js
const commonTokens = require("@sage/design-tokens/js/common");
const buttonTokens = commonTokens.button;

element.style.backgroundColor = buttonTokens.buttonDestructivePrimaryBgDefault;
```

#### ES6 module

```js
import { button } from "@sage/design-tokens/js/es6";

element.style.backgroundColor = button.buttonDestructivePrimaryBgDefault;
```

A type definition file is also included to work in projects with typescript installed.

### iOS / Swift

The build generates Swift token files in `dist/ios/`, which stays out of Git. It also combines them into the single package source file at `Sources/SageDesignTokens/Tokens.swift`. Commit that generated file when tokens change so a Git checkout contains the package. The generated colours are `UIColor` values; spacing and radii are `CGFloat` values. Light and dark token namespaces remain separate, matching the source mode references.

In Xcode, choose **File → Add Package Dependencies**, enter `https://github.com/Sage/design-tokens.git`, and select the `ios_spike` branch for the beta. After the package reaches a release, switch the dependency to the first version tag that includes `Package.swift`. The Swift import stays the same:

```swift
import SageDesignTokens
import SwiftUI

let background = Color(uiColor: SageTokensLight.modeColorGenericBgNought)
let buttonBackground = Color(uiColor: SageTokensLightButton.buttonTypicalPrimaryBgDefault)
```

The package supports iOS 16 or later and builds in Swift 6 language mode.

#### Add to an iOS target

For a direct file handoff, add `global.swift`, `light.swift`, `dark.swift`, and the required files from `components/` to the Xcode target. When files are compiled directly into the app target, no separate Swift module import is required.

#### Available files

- Global tokens: `dist/ios/global.swift`
- Light mode tokens: `dist/ios/light.swift`
- Dark mode tokens: `dist/ios/dark.swift`
- Components: `dist/ios/components/`

Each component file contains light and dark namespaces. Component token references are retained to the matching mode and global namespaces.

#### Composite tokens

Gradients, shadows, and static typography are exported as structured Swift descriptors. These preserve token references and expose the underlying token data without choosing a rendering framework. Responsive typography roles that use CSS `clamp()` and viewport units remain web-only; iOS consumers should map those roles to their Dynamic Type strategy. Consumers can adapt the descriptors to their platform APIs while retaining the token names, values, theme handling, and accessibility behaviour that suit their application.

The generated Swift files do not include the Sage UI font files. Apps using those fonts need to provide them separately.

#### Other formats

It is possible to export design tokens to any format or language. If you need to use design tokens in your technology, please contact us and describe your needs.

## Contributing

If you would like to help contribute to this library, please read our [contributing documentation](./CONTRIBUTING.md),

## Licence

Licensed under the Apache License, Version 2.0 (the "License");
you may not use these files except in compliance with the License.
You may obtain a copy of the License at [Apache 2.0 license](./license).

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Copyright (c) 2025 Sage Group Plc. All rights reserved.
