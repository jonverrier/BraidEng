
//var nodeExternals = require('webpack-node-externals');

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

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
         }
      ]
   }
}