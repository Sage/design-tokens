# Pre-transform Phase

Design Tokens JSON format provided by [Figma Tokens plugin](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens) does not meet our expectations. Plugin has few features that helps Designers maintenance of the tokens, however it produces values, that are not understandable tor `style-dictionary`, for example:
- Plugin accepts different formats of referencing - using `{}` brackets, and starting with dollar sign `$`, while `style-dictionary` uses only curly brackets.
- Plugin allows Designers to use references together with alpha channel, like `rgba($colors.major.500, 0.5)`, while `style-dictonary` does not understand such syntax.
- Complex tokens, like typography have multiple properties like `fontFamily`, `fontSize`, `fontWeight`. Using [token-transformer](https://www.npmjs.com/package/token-transformer) written by the author of the plugin creates separate token for each property, while what we consider typography token as a full definition of typography.

Pre-transform phase was introduced to solve this issue.

## omod
[Omod](https://www.npmjs.com/package/omod) package is used to transform the JSON object. Omod package has built in modifiers for figma tokens, so eventually the proper format is provided. Modifiers are pipeable, therefore you can add your own modifier if needed.

It resolves all references, resolves and converts all color values to hex8 format and builds single `value` property for complex tokens.  

## Pretransformed tokens
Output file is written to `temp/tokens.json`. This is the entry point (not the `data/tokens.json`) for all further transforms.
