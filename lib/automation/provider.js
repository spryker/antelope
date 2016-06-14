/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const fs = require('graceful-fs');
const R = require('ramda');
const context = require('../context');
const cwd = process.cwd();

function getAlias(src) {
    return fs.readdirSync(src)
        .filter(dir => fs.statSync(path.join(src, dir)).isDirectory())
        .reduce((list, dir) => {
            list[`@${dir.toLowerCase()}`] = `${dir}/assets/Zed/src`;
            return list;
        }, {});
}

function createContextRequire() {
    function contextRequire(id) {
        try {
            return require(`${cwd}/node_modules/${id}`);
        } catch (err) {
            return require(id);
        }
    }

    return Object.assign(contextRequire, require);
}

function getAntelope(file, entryPoints, manifests) {
    let alias = getAlias(path.join(path.dirname(file), '../../../'));
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
        alias: alias,
        paths: {
            root: rootPaths,
            loaders: loadersPaths
        }
    };
}

module.exports = {
    import: (file, entryPoints, manifest) => {
        let context = require('module');
        let body = fs.readFileSync(file, 'utf8');
        let fn = new Function('module', 'exports', 'require', '__dirname', 'antelope', body);
        let args = [
            context,
            context.exports,
            createContextRequire(),
            path.dirname(file),
            getAntelope(file, entryPoints, manifest)
        ];

        fn.apply(context, args);
        return context.exports;
    }
};
