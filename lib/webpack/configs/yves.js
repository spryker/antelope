/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

var path = require('path');
var context = require('../../context');
var cwd = process.cwd();

// webpack
let webpack = require('webpack');

process.mainModule.paths.push(path.join(cwd, './node_modules'));

module.exports = {
    load: (entryPoints) => {
        let root = [
            cwd,
            path.join(cwd, './node_modules')
        ];

        let config = {
            antelope: {},
            context: cwd,
            entry: entryPoints,
            resolve: {
                root: root
            },
            resolveLoader: {
                root: process.mainModule.paths
            },
            output: {
                path: path.join(cwd, './public/Yves/assets/unknown-theme')
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
    }
};
