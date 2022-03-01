const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './content-script/boot.ts',
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },],
    },

    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback:{ 
            "https": require.resolve("https-browserify"),
            "http": require.resolve("stream-http"),
            "crypto": require.resolve("crypto-browserify")
        },
    },
    output: {
        filename: 'content-script.js',
        path: path.resolve(__dirname, 'dist'),
    },
};