
import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

/** @type { import('@storybook/preact-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(ts|tsx)', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // addons: [
  //   '@storybook/addon-onboarding',
  //   '@storybook/addon-links',
  //   '@storybook/addon-essentials',
  //   '@chromatic-com/storybook',
  //   '@storybook/addon-interactions',
  // ],
  framework: getAbsolutePath('@storybook/preact-vite'),
  async viteFinal(config, { configType }) {
    const path = await import('path');
    const { default: pathDefault } = path;
    const configDir = pathDefault.dirname(fileURLToPath(import.meta.url));

    // alias 설정
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'core-js/modules': pathDefault.resolve(configDir, '../../../node_modules/core-js/modules'),
      '@modules': pathDefault.resolve(configDir, '../../../../node_modules/'),
      '@src': pathDefault.resolve(configDir, '../src/'),
      '@t': pathDefault.resolve(configDir, '../src/types/'),
      '@stories': pathDefault.resolve(configDir, '../stories/'),
    };

    // esbuild 설정 (Preact JSX 사용)
    config.esbuild = config.esbuild || {};
    config.esbuild.jsxFactory = 'h';
    config.esbuild.jsxFragment = 'Fragment';

    return config;
  },
};

export default config;