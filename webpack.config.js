var path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const keysTransformer = require('ts-transformer-keys/transformer').default;

let files = {
	'add-movie': './src/add-movie.ts',
	'get-movie-by-id': './src/get-movie-by-id.ts',
	'get-movies': './src/get-movies.ts'
};

/** @type {import('webpack').Configuration} */
const webpack = {
	mode: "production",
	externals: [
		"aws-sdk"
	], //avoid un-needed modules since aws-sdk exists in aws lambdas already
	entry: files,
	module: {
		rules: [{
			test: /\.tsx?$/,
			loader: 'ts-loader',
			options: {
				// make sure not to set `transpileOnly: true` here, otherwise it will not work
				getCustomTransformers: program => ({
					before: [keysTransformer(program)]
				})
			},
			exclude: /node_modules/
		}]
	},
	target: "node",
	//stats: 'detailed',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			"@": "src",
		}
	},
	output: {
		path: path.join(__dirname, "./out"),
		filename: "[name].js",
		libraryTarget: "umd",
	},
	plugins: [new BundleAnalyzerPlugin({
		analyzerMode: 'static'
	})]
};

module.exports = webpack;