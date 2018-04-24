const path = require('path');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = merge(common, {
	mode: 'production',
	devtool: 'source-map',

	output: {
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[name].[chunkhash].js',
    publicPath: '/',
    path: path.resolve(__dirname, '../build')
  },

	plugins: [
    new ExtractTextPlugin({
			filename: 'css/[name].[hash].css',
			allChunks: true
		}),
		new UglifyJSPlugin({
			sourceMap: true
		}),
		new OptimizeCssAssetsPlugin(),
		// new ManifestPlugin()
	]
});
