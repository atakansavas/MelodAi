module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin must be listed last
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': '.',
            '@components': './components',
            '@hooks': './hooks',
            '@constants': './constants',
            '@utils': './utils',
            '@screens': './app',
            '@assets': './assets',
            '@types': './types',
            '@services': './services',
            '@store': './store',
            '@agents': './agents',
          },
        },
      ],
      // Environment variable plugin
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      // Optional: Transform remove console in production
      process.env.NODE_ENV === 'production' && ['transform-remove-console'],
      // React Native Reanimated - must be last
      'react-native-reanimated/plugin',
    ].filter(Boolean),
  };
};