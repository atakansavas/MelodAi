const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom resolver options
config.resolver = {
  ...config.resolver,
  // Add custom extensions
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  // Configure asset extensions
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  // Add path aliases that match tsconfig.json
  alias: {
    '@': path.resolve(__dirname),
    '@components': path.resolve(__dirname, 'components'),
    '@hooks': path.resolve(__dirname, 'hooks'),
    '@constants': path.resolve(__dirname, 'constants'),
    '@utils': path.resolve(__dirname, 'utils'),
    '@screens': path.resolve(__dirname, 'app'),
    '@assets': path.resolve(__dirname, 'assets'),
    '@types': path.resolve(__dirname, 'types'),
    '@services': path.resolve(__dirname, 'services'),
    '@store': path.resolve(__dirname, 'store'),
    '@agents': path.resolve(__dirname, 'agents'),
  },
};

// Add transformer options
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Performance optimizations
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add CORS headers for web
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      return middleware(req, res, next);
    };
  },
};

// Cache configuration
config.cacheStores = [
  {
    name: 'default',
    stores: [
      {
        name: 'filesystem',
        root: path.join(__dirname, '.metro-cache'),
      },
    ],
  },
];

module.exports = config;