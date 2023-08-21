module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    'storybook-design-token',
    '@storybook/addon-links',
    '@storybook/addon-essentials'
  ],
  babel: async (options) => {
    return {
      ...options,
      presets: [...options.presets, '@babel/preset-react'],
    };
  },
  core: {
    builder: 'webpack5'
  }
};