/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let fs = require('graceful-fs');
let R = require('ramda');
let context = require('../context');
let cwd = process.cwd();

function contextRequire(id) {
    try {
        return require(`${cwd}/node_modules/${id}`);
    } catch (err) {
        return require(id);
    }
}

function getAntelope(entryPoints, manifests) {
    let loadersPaths = process.mainModule.paths.concat([path.join(cwd, './node_modules')]);
    let rootPaths = [
        cwd,
        path.join(cwd, './node_modules')
    ].concat(R.map((manifest) => {
        return path.join(path.dirname(manifest), './node_modules');
    }, R.keys(manifests)));

    return {
        remote: (id) => require(id),
        options: context.options(),
        entryPoints: entryPoints,
        paths: {
            root: rootPaths,
            loaders: loadersPaths
        }
    };
}

module.exports = {
    import: (id, entryPoints, manifest) => {
        let context = require('module');
        let body = fs.readFileSync(id, 'utf8');
        let fn = new Function('module', 'exports', 'require', '__dirname', 'antelope', body);
        let args = [
            context, 
            context.exports, 
            contextRequire, 
            path.dirname(id),
            getAntelope(entryPoints, manifest)
        ];

        fn.apply(context, args);
        return context.exports;
    }
};
