const path = require('path');
const webpack = require('webpack');

module.exports = {
    chainWebpack: config => {
        config.plugin('html').tap(args => {
            args[0].title = 'e家宜业';
            return args;
        });
    },
    configureWebpack: {
        resolve: {
            extensions: ['.js', '.vue'],
            alias: {
                '@': path.join(__dirname, 'src')
            }
        },
        plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
        output: {
            filename: 'js/[name].[hash:8].js',
            chunkFilename: 'js/[name].[hash:8].js'
        }
    },
    css: {
        extract: process.env.NODE_ENV === 'production',
        sourceMap: false
    },
    productionSourceMap: false,
    devServer: {
        open: true,
        historyApiFallback: true,
        proxy: {
            '/pc': {
                target: 'http://127.0.0.1:6688',
                changeOrigin: true
            },
            '/cws': {
                target: 'ws://127.0.0.1:6688',
                ws: true
            }
        }
    }
};
