/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const { resolve } = require("path");
const omod = require("omod").omod;

const groupBy = require("lodash/groupBy");
const kebabCase = require("lodash/kebabCase");
const mapValues = require("lodash/mapValues");

const { readJsonSync, readFileSync } = require("fs-extra");

const { dictionary, groups } = require("./style-dictionary");
const collect = require("./utils/collect");

const transformTokens = (tokens) => {
  return dictionary
    .extend({
      tokens,
      platforms: {
        docs: { transforms: groups.web },
      },
    })
    .exportPlatform("docs");
};

const groupTokens = (flattenedTokens) => {
  const tokensByTheme = groupBy(flattenedTokens, "attributes.theme");
  return mapValues(tokensByTheme, (app) => groupBy(app, "attributes.category"));
};

/**
 * @typedef TokensDocumentationConfig
 * @property {string} mainTemplate - Path to main template for documentation
 * @property {string} docsPartials - Glob to partials for tokens documentation
 * @property {string} docsDir - Output dir for generated documentation
 */

/**
 * @param {TokensDocumentationConfig} config - config for Tokens documentation generator
 */
((config) => {
  console.log("Building Documentation for design tokens...");

  const buildDocsFile = require("./handlebars")(config.docsPartials);
  const mainTemplateContents = readFileSync(
    resolve(process.cwd(), config.mainTemplate),
    "utf8"
  );
  const tokens = readJsonSync("temp/tokens.json");

  const transformedTokens = transformTokens(tokens);
  const flattenedTokens = collect(
    transformedTokens,
    (node) => node.value && node.original
  );
  const filteredTokens = flattenedTokens.filter(
    (token) => token.attributes.category !== "meta"
  );
  const groupedTokens = groupTokens(filteredTokens);

  const navigation = omod(groupedTokens, undefined, (node) =>
    node?.name ? undefined : node
  );

  const generalContext = {
    title: "Sage Design Tokens",
    bodyType: "general",
    themes: groupedTokens,
    navigation,
  };
  buildDocsFile(mainTemplateContents, generalContext, [
    config.docsDir,
    "index.html",
  ]);

  Object.entries(groupedTokens).forEach(([theme, categories]) => {
    const themeContext = {
      title: `Sage Design Tokens / ${theme}`,
      bodyType: "theme",
      themeName: theme,
      categories,
      navigation,
    };
    buildDocsFile(mainTemplateContents, themeContext, [
      config.docsDir,
      kebabCase(theme),
      "index.html",
    ]);

    Object.entries(categories).forEach(([category, tokens]) => {
      const categoryContext = {
        title: `Sage Design Tokens / ${theme} / ${category}`,
        bodyType: "category",
        themeName: theme,
        categoryName: category,
        tokens,
        navigation,
      };
      buildDocsFile(mainTemplateContents, categoryContext, [
        config.docsDir,
        kebabCase(theme),
        kebabCase(category),
        "index.html",
      ]);
    });
  });

  console.log("Done.\r\n");
})({
  mainTemplate: "templates/layout.hbs",
  docsPartials: "templates/partials/**/*.hbs",
  docsDir: "dist/docs/tokens",
});
