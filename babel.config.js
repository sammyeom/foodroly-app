module.exports = {
  presets: ['babel-preset-granite'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env.local',
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
