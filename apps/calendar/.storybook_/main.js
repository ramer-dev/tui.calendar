const path = require('path');

module.exports = {
  core: {
    builder: '@storybook/builder-vite'
  },
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  stories: ['../**/*.stories.@(ts|tsx)'],
  // Vite builder를 사용할 때는 viteFinal 설정 사용
  async viteFinal(config, { configType }) {
    // alias 설정
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'core-js/modules': path.resolve(__dirname, '../../../node_modules/core-js/modules'),
      '@src': path.resolve(__dirname, '../src/'),
      '@t': path.resolve(__dirname, '../src/types/'),
      '@stories': path.resolve(__dirname, '../stories/'),
    };

    // esbuild 설정 (Preact JSX 사용)
    config.esbuild = config.esbuild || {};
    config.esbuild.jsxFactory = 'h';
    config.esbuild.jsxFragment = 'Fragment';

    // CSS 처리 (Vite는 기본적으로 CSS를 지원하므로 별도 설정 불필요)
    // PostCSS는 vite.config.ts에서 처리하거나 여기서 설정 가능

    return config;
  },
};
