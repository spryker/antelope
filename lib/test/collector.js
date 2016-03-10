/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let context = require('../context');
let errors = require('../errors');
let collector = require('../automation/collector');

function yvesEntities(entities) {
    return R.pickBy((path, name) => {
        return path.search(new RegExp(context.patterns.defaultYves(), 'i')) > -1;
    }, entities);
}

function zedEntities(entities) {
    return R.pickBy((path, name) => {
        return path.search(new RegExp(context.patterns.defaultZed(), 'i')) > -1;
    }, entities);
}

function unknownEntities(entities) {
    return R.pickBy((path, name) => {
        return path.search(new RegExp(context.patterns.defaultYves(), 'i')) > -1
            && path.search(new RegExp(context.patterns.defaultZed(), 'i')) > -1;
    }, entities);
}

function log(target, collectedResults, warnMessage) {
    let collectedResultsNames = R.keys(collectedResults);

    if (!!warnMessage) {
        console.log(`| - ${target}:`.grey, `${collectedResultsNames.length}`.yellow);
    } else {
        console.log(`| - ${target}:`.grey, `${collectedResultsNames.length}`.cyan);
    }

    if (collectedResultsNames.length > 0) {
        R.forEach((name) => {
            if (!!warnMessage) {
                console.log(`|   ${String.fromCharCode(0x2517)} ${name}:`.gray, collectedResults[name].yellow);
            } else {
                console.log(`|   ${String.fromCharCode(0x2517)} ${name}:`.gray, collectedResults[name].magenta);
            }
        }, collectedResultsNames);

        if (!!warnMessage) {
            console.log('|'.grey);
            console.warn('|'.grey, warnMessage.yellow);
        }
    }
}

module.exports = {
    run: () => {
        return new Promise((resolve, reject) => {
            Promise.all([
                collector.entryPoints(),
                collector.extensions()
            ]).then((results) => {
                try {
                    let entryPoints = results[0];
                    let extensions = results[1];

                    console.log('\nCollector test'.bold.grey);
                    console.log('Search and analyze all the entities (entry points and extensions) in the project'.gray);
                    console.log('|'.gray);
                    console.log('| Entry points:'.grey, `${entryPoints.count.total}`.cyan);
                    console.log('| - valid:'.grey, `${entryPoints.count.valid}`.cyan);

                    log('YVES', yvesEntities(entryPoints.valid));
                    log('ZED', zedEntities(entryPoints.valid));
                    log('duplicates', entryPoints.duplicates, '[!] Fix duplicates entry points or they may never get builded');
                    log('unknown', unknownEntities(entryPoints.valid), '[!] Fix unknown entry points or they may never get builded');

                    console.log('|'.gray);
                    console.log('| Extensions:'.grey, `${extensions.count.total}`.cyan);
                    console.log('| - valid:'.grey, `${extensions.count.valid}`.cyan);

                    log('YVES', yvesEntities(extensions.valid));
                    log('ZED', zedEntities(extensions.valid));
                    log('duplicates', extensions.duplicates, '[!] Fix duplicates extensions or they may overwrite the previous one');
                    log('unknown', unknownEntities(extensions.valid), '[!] Fix unknown extensions or they may be ignored');

                    return resolve();
                } catch (err) {
                    throw errors.enrich(err, 'collector test');
                }
            });
        });
    }
};
