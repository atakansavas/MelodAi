const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path aliases that match tsconfig.json
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'components'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@constants': path.resolve(__dirname, 'constants'),
  '@utils': path.resolve(__dirname, 'utils'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@assets': path.resolve(__dirname, 'assets'),
  '@types': path.resolve(__dirname, 'types'),
  '@services': path.resolve(__dirname, 'services'),
  '@store': path.resolve(__dirname, 'store'),
  '@agents': path.resolve(__dirname, 'agents'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
};

module.exports = config;