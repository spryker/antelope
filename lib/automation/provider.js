/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let fs = require('graceful-fs');
let R = require('ramda');
let cwd = process.cwd();
let report = {};

function extendedRequire(id) {
    let requiredModule;

    try {
        requiredModule = require(`${cwd}/node_modules/${id}`);
        report[id] = 'project';
        return requiredModule;
    } catch (err) {
        requiredModule = require(id);
        report[id] = 'antelope';
        return requiredModule;
    }
}

module.exports = {
    import: (id) => {
        let context = require('module');
        let body = fs.readFileSync(id, 'utf8');
        let fn = new Function('module', 'exports', 'require', body);

        fn.apply(context, [context, context.exports, extendedRequire]);
        return context.exports;
    },
    report: () => {
    	R.forEach((id) => {
    		console.log('  -'.gray, id.magenta, 'imported from'.gray, report[id].cyan);
    	}, R.keys(report));
        
        report = {};
    }
};
