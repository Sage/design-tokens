module.exports = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circle',
        items: ['light', 'dark', 'high-contrast'],
        dynamicTitle: true,
      },
    },
  }
};