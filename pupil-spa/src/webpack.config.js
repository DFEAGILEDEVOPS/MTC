'use strict'
var ExtractTextPlugin = require("extract-text-webpack-plugin")

var plugins = [
  new ExtractTextPlugin("[name].css")
];

module.exports = {
  context: __dirname + '/src',

  entry: {
    vendor: ['./css/vendor.less'],
    app: ['./css/app.less']
  },

  output: {
    path: __dirname + '/public/build',
    filename: '[name].js'
  },

  devtool: "source-map",

  plugins: plugins,

  module: {
    loaders: [
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract("css?sourceMap!less?sourceMap")
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file?name=fonts/[name]/[name].[ext]?[hash]'
      }
    ]
  }
};
