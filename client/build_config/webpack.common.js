const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
  	index: './src/index.js'
  },

	module: {
		rules: [
			{
        test: /\.js$/, exclude: /node_modules/, loader: "babel-loader",
        query: {
          plugins: ["syntax-dynamic-import"],
          presets: ["react"]
        }
      },
      {
        test: /\.html$/, loader: 'html-loader'
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
        	fallback: "style-loader",
        	use: ["css-loader", "less-loader"]
        })
      },
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
        	fallback: "style-loader",
        	use: "css-loader"
        })
      }
		]
	},

  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      filename: 'index.html'
    }),
    new CleanWebpackPlugin(['build'], { root: path.resolve(__dirname , '..') })
  ]

};
