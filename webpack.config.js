const path = require('path');

module.exports = {
    entry: './content-script/boot.ts',
    mode: 'production',
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },],
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