/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const context = require('../context');
const cwd = process.cwd();

module.exports = {
    getDefault: () => {
        return {
            antelope: {},
            context: cwd,
            debug: context.has('debug'),
            watch: context.has('watch')
        };
    },
    legacy: {
        yves: (entryPoints, manifests) => {
        	let path = require('path');
            let context = require('../context');
            let loadersPaths = process.mainModule.paths.concat([path.join(cwd, './node_modules')]);
            let rootPaths = [
                cwd,
                path.join(cwd, './node_modules')
            ];

            let config = {
                antelope: {},
                context: cwd,
                entry: entryPoints,
                resolve: {
                    root: rootPaths
                },
                resolveLoader: {
                    root: loadersPaths
                },
                watchOptions: {
                    aggregateTimeout: 300,
                    poll: 1000
                },
                plugins: [],
                progress: true,
                failOnError: false,
                debug: context.has('debug'),
                watch: context.has('watch')
            };

            return config;
        },
        zed: (entryPoints, manifests) => {
            let path = require('path');
            let R = require('ramda');
            let globby = require('globby');
            let webpack = require('webpack');
            let ExtractTextPlugin = require('extract-text-webpack-plugin');
            let context = require('../context');
            let anchor = globby.sync([
                '**/spryker-zed-gui-commons.entry.js'
            ], {
                cwd: cwd,
                nocase: true
            });
            let guiPath = path.join(cwd, anchor[0], '../../../../');
            let bundlesPath = path.join(guiPath, '../');
            let loadersPaths = process.mainModule.paths.concat([path.join(cwd, './node_modules')]);
            let rootPaths = R.map((manifest) => {
                return path.join(path.dirname(manifest), './node_modules');
            }, R.keys(manifests)).concat([
                cwd,
                path.join(cwd, './node_modules'),
                bundlesPath
            ]);

            let config = {
                antelope: {},
                context: cwd,
                entry: entryPoints,
                resolve: {
                    root: rootPaths,
                    alias: {
                        ZedGui: `${path.basename(guiPath)}/assets/Zed/js/modules/commons`
                    }
                },
                resolveLoader: {
                    root: loadersPaths
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
                    includePaths: loadersPaths
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
                    })
                ],
                watchOptions: {
                    aggregateTimeout: 300,
                    poll: 1000
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
    }
};
