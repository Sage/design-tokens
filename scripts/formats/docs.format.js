/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const fs = require("fs-extra");
const path = require("path");
const groupBy = require("lodash/groupBy");
const omit = require("lodash/omit");
const isObject = require("lodash/isObject");
const isArray = require("lodash/isArray");
const sortBy = require("lodash/sortBy");

module.exports = {
  name: "docs",
  formatter: function ({ dictionary }) {
    const templateContents = fs.readFileSync(
      path.resolve(".", "templates/layout.hbs"),
      "utf8"
    );
    const Handlebars = require("handlebars");
    Handlebars.registerPartial(
      "body",
      fs.readFileSync(
        path.resolve(".", "templates/tokens/tokens.docs.hbs"),
        "utf8"
      )
    );
    Handlebars.registerPartial(
      "table",
      fs.readFileSync(path.resolve(".", "templates/tokens/table.hbs"), "utf8")
    );

    const flatTokens = [...dictionary.allTokens]
      .filter((token) => token.attributes.category !== "meta")
      .map((token) => omit(token, ["filePath", "isSource"]));

    const tokensByTheme = groupBy(flatTokens, "attributes.theme");

    const contextEntries = Object.entries(tokensByTheme).map(
      ([themeName, themeTokens]) => {
        const tokensByCategory = groupBy(themeTokens, "attributes.category");
        const categories = Object.entries(tokensByCategory).map(
          ([categoryName, tokens]) => {
            const sortedTokens = tokens
              .slice()
              .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );

            return {
              categoryName,
              tokens: sortedTokens,
            };
          }
        );
        const sortedCategoriesByCategoryName = sortBy(
          categories,
          "categoryName",
          "asc"
        );

        return {
          themeName,
          categories: sortedCategoriesByCategoryName,
        };
      }
    );

    const templateContext = {
      themes: contextEntries,
      title: "Sage Design Tokens",
    };

    Handlebars.registerHelper("debug", (value) => {
      if (isObject(value) || isArray(value)) {
        return JSON.stringify(value, null, 2);
      }

      return value;
    });

    const compile = Handlebars.compile(templateContents, {
      preventIndent: true,
    });

    return compile(templateContext);
  },
};
