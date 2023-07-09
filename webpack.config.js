const path = require('path');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './server.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    externals: [
        {
            sharp: 'commonjs sharp'
        }
    ]
};
