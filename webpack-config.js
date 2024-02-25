
//var nodeExternals = require('webpack-node-externals');

module.exports = {
   devtool: 'source-map',
   entry: "./ui/AppEntry.tsx",
   mode: "development",
   target: 'web', 
   externals: [],
   output: {
      filename: "fsbot.min.js",
      devtoolModuleFilenameTemplate: '[resource-path]',  // removes the webpack:/// prefix
      libraryTarget: 'window'
   },
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