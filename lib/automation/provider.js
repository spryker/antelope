/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let fs = require('graceful-fs');
let R = require('ramda');
let cwd = process.cwd();
var report = {};

function createContext(id) {
    delete require.cache[require.resolve('./provider.dummy-module')];
    return require('./provider.dummy-module')(id);
}

function extendedRequire(id) {
    let requiredModule;

    try {
        requiredModule = require(`${cwd}/node_modules/${id}`);
        report[id] = 'project';
        return requiredModule;
    } catch (err) {
        requiredModule = require(id);
        report[id] = 'spy';
        return requiredModule;
    }
}

module.exports = {
    import: (id) => {
        let moduleContext = createContext(id);
        let moduleBody = fs.readFileSync(id, 'utf8');
        let moduleFn = new Function('module', 'exports', 'require', moduleBody);

        moduleFn.apply(moduleContext, [moduleContext, moduleContext.exports, extendedRequire]);
        return moduleContext.exports;
    },
    report: () => {
    	R.forEach((id) => {
    		console.log('  -'.gray, id.magenta, 'imported from'.gray, report[id].cyan);
    	}, R.keys(report));
        
        report = {};
    }
};
