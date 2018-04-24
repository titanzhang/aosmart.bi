const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',

	output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, '../build')
  },

  devServer: {
		historyApiFallback: true,
    contentBase: path.resolve(__dirname, '../build'),
    port: 3001
  },

  plugins: [
		new ExtractTextPlugin('css/[name].css')
	]
});
