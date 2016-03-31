/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const globby = require('globby');
const semver = require('semver');
const errors = require('../errors');
const pkg = require('../../package');
const cwd = process.cwd();

function checkCompatibility() {
    let composer = {};
    let isCompatible = false;
    let manifests = globby.sync([
        '**/gui/composer.json'
    ], {
        cwd: cwd,
        nocase: true
    });

    if (manifests.length === 1) {
        composer = require(path.join(cwd, manifests[0]));
        isCompatible = semver.satisfies(pkg.version, composer.antelope || '0');
    }

    return {
        isCompatible: isCompatible,
        version: pkg.version,
        range: composer.antelope || 'unknown'
    };
}

module.exports = {
    run: () => {
        return new Promise((resolve, reject) => {
            let results = checkCompatibility();

            console.log('\nVersion test'.bold.gray);
            console.log('Check compatibilty with Spryker GUI bundle'.gray);
            console.log('|'.gray);
            console.log('| Version'.gray, results.version.cyan, '-> Range'.gray, results.range.cyan);

            if (results.isCompatible) {
                console.log('|'.gray, 'This version is'.gray, 'compatible'.green);
                return resolve();
            } else {
                console.error('|'.gray, 'This version is'.gray, 'not compatible'.red);
                return reject(errors.enrich(new Error('Update this tool targeting a version within the required range'), 'version test'));
            }
        });
    },
    print: () => {
        let results = checkCompatibility();
        console.log('version:'.gray, results.version.cyan);
        console.log('range:'.gray, results.range.cyan);
        console.log('compatible:'.gray, results.isCompatible ? 'true'.green : 'false'.red);
    }
};
