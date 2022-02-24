module.exports = {
    resolve: {
        fallback:{ 
            "https": require.resolve("https-browserify"),
            "http": require.resolve("stream-http"),
            "crypto": require.resolve("crypto-browserify")
        },
    },
};