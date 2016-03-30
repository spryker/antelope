/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let globby = require('globby');
let context = require('../../context');
let cwd = process.cwd();

// webpack
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

// anchor
let anchor = globby.sync([
    '**/spryker-zed-gui-commons.entry.js'
], {
    cwd: cwd,
    nocase: true
});

let guiPath = path.join(cwd, anchor[0], '../../../../');
let bundlesPath = path.join(guiPath, '../');

process.mainModule.paths.push(path.join(cwd, './node_modules'));
process.mainModule.paths.push(path.join(cwd, './lib/automation/webpack'));

module.exports = {
    load: (entryPoints, manifests) => {
        let root = [
            path.join(cwd, './node_modules'),
            bundlesPath
        ].concat(R.map((manifest) => {
            return path.join(path.dirname(manifest), './node_modules');
        }, R.keys(manifests)));

        let config = {
            antelope: {},
            context: cwd,
            entry: entryPoints,
            resolve: {
                root: root,
                alias: {
                    ZedGui: `${path.basename(guiPath)}/assets/Zed/js/modules/commons`
                }
            },
            resolveLoader: {
                root: process.mainModule.paths
            },
            output: {
                path: path.join(cwd, './public/Zed'),
                filename: 'assets/js/[name].js'
            },
            module: {
                loaders: [{
                    test: /\.css\??(\d*\w*=?\.?)+$/i,
                    loader: ExtractTextPlugin.extract('style', 'css')
                }, {
                    test: /\.scss$/i,
                    loader: ExtractTextPlugin.extract('style', 'css!resolve-url!sass?sourceMap')
                }, {
                    test: /\.(ttf|woff2?|eot)\??(\d*\w*=?\.?)+$/i,
                    loader: 'file?name=/assets/fonts/[name].[ext]'
                }, {
                    test: /\.(jpe?g|png|gif|svg)\??(\d*\w*=?\.?)+$/i,
                    loader: 'file?name=/assets/img/[name].[ext]'
                }]
            },
            sassLoader: {
                includePaths: process.mainModule.paths
            },
            plugins: [
                new webpack.optimize.CommonsChunkPlugin('spryker-zed-gui-commons', 'assets/js/spryker-zed-gui-commons.js'),
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',

                    // legacy provider
                    SprykerAjax: 'Gui/assets/Zed/js/modules/legacy/SprykerAjax',
                    SprykerAjaxCallbacks: 'Gui/assets/Zed/js/modules/legacy/SprykerAjaxCallbacks',
                    SprykerAlert: 'Gui/assets/Zed/js/modules/legacy/SprykerAlert'
                }),
                new ExtractTextPlugin('assets/css/[name].css', {
                    allChunks: true
                }),
                new webpack.DefinePlugin({
                    PRODUCTION: context.has('production'),
                    WATCH: context.has('watch'),
                    'require.specified': 'require.resolve'
                }),
                new webpack.NewWatchingPlugin()
            ],
            watchOptions: {
                poll: true
            },
            progress: true,
            failOnError: false,
            devtool: 'sourceMap',
            debug: context.has('debug'),
            watch: context.has('watch')
        };

        if (context.has('production')) {
            config.plugins = config.plugins.concat([
                new webpack.optimize.UglifyJsPlugin({
                    comments: false,
                    sourceMap: context.has('debug'),
                    compress: {
                        warnings: context.has('debug')
                    },
                    mangle: {
                        except: ['$', 'exports', 'require']
                    }
                })
            ]);
        }

        return config;
    }
};
