// http://webpack.github.io/docs/configuration.html
// http://webpack.github.io/docs/webpack-dev-server.html
var app_root = 'src'; // the app root folder: src, src_users, etc
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    app_root: app_root, // the app root folder, needed by the other webpack configs
    entry: [
        'babel-polyfill',
        __dirname + '/' + app_root + '/index.js',
    ],
    output: {
        path: __dirname + '/public/js',
        publicPath: 'js/',
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    plugins: ['transform-decorators-legacy'],
                    presets: ['es2015', 'stage-0', 'react'],
                }
            },
            {
                // https://github.com/jtangelder/sass-loader
                test: /\.scss$/,
                loaders: ['style', 'css?importLoaders=1', 'postcss-loader?parser=postcss-js!babel', 'sass'],
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css'],
            }
        ],
    },
    postcss: function () { // postcss 插件
        return [require('precss'), require('autoprefixer')];
    },
    devServer: {
        contentBase: __dirname + '/public',
    },
    plugins: [
        new CleanWebpackPlugin(['css/main.css', 'js/bundle.js'], {
            root: __dirname + '/public',
            verbose: true,
            dry: false, // true for simulation
        })
    ],
};
