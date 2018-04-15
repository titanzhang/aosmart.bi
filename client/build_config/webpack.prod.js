const path = require('path');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common.js');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

common.output.filename = 'js/[name].[chunkhash].js';

module.exports = merge(common, {
	devtool: 'source-map',

	plugins: [
    new ExtractTextPlugin('css/[name].[contenthash].css'),
		new UglifyJSPlugin({
			sourceMap: true
		}),
		new OptimizeCssAssetsPlugin(),
		new ManifestPlugin()
	]
});
