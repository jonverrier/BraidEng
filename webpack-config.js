
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

// webpack.config.js
const {
  default: FluentUIReactIconsFontSubsettingPlugin,
} = require('@fluentui/react-icons-font-subsetting-webpack-plugin');

module.exports = {
   devtool: 'source-map',
   entry: "./ui/AppEntry.tsx",
   mode: "development",
   target: 'web', 
   externals: [],
   output: {
      filename: "aibot.pack.js",
      devtoolModuleFilenameTemplate: '[resource-path]',  // removes the webpack:/// prefix
      libraryTarget: 'window'
   },
   plugins: [
      new NodePolyfillPlugin()
   ],   
   resolve: {
      extensions: ['.tsx', '.ts', '.js']
   },
   module: {
      rules: [
         {
            test: /\.tsx$/,
            exclude: /(node_modules|bower_components)/,
            use: {
               loader: 'ts-loader',
               options: {
                  configFile: "tsconfig.json"
               }
            }
         },
         {
            test: /\.ts$/,
            exclude: /(node_modules|bower_components)/,
            use: {
               loader: 'ts-loader',
               options: {
                  configFile: "tsconfig.json"
               }
            }
         },         
         {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/
         },
         // Treat the font files as webpack assets
         {
            test: /\.(ttf|woff2?)$/,
            type: 'asset',
         },         
      ]
   },
   resolve: {
      // Include 'fluentIconFont' to use the font implementation of the Fluent icons
      conditionNames: ['fluentIconFont', 'import'],
    },
    plugins: [
      // Include this plugin
      new FluentUIReactIconsFontSubsettingPlugin(), new NodePolyfillPlugin()
    ]   
}