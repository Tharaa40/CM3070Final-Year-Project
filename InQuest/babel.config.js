// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     env:{
//       production: {
//         plugins: ['react-native-paper/babel',
//           'react-native-reanimated/plugin', 
//           '@babel/plugin-proposal-class-properties',
//           '@babel/plugin-transform-flow-strip-types',
//         ],
//       },
//     },
//   };
// };



module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-paper/babel',
      'react-native-reanimated/plugin',
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      '@babel/plugin-transform-flow-strip-types',
    ],
    env: {
      production: {
        plugins: [
          'react-native-paper/babel',
          'react-native-reanimated/plugin',
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }],
          '@babel/plugin-transform-flow-strip-types',
        ],
      },
    },
  };
};


