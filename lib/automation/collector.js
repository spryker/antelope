/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */
 
'use strict';

let path = require('path');
let R = require('ramda');
let globby = require('globby');
let context = require('../context');
let errors = require('../errors');
let cwd = process.cwd();

function collect(searchSubjects, searchPaths, basePattern) {
    return new Promise((resolve, reject) => {
        globby(searchPaths, {
            cwd: cwd,
            follow: context.has('follow'),
            nocase: true
        }).then((foundPaths) => {
            try {
                let duplicatesCountersMap = {};
                let results = {
                    valid: {},
                    duplicates: {},
                    count: {
                        valid: 0,
                        duplicates: 0,
                        total: foundPaths.length
                    }
                };

                R.forEach((foundPath) => {
                    let name = basePattern ? path.basename(foundPath, basePattern) : foundPath;
                    foundPath = `./${path.relative(cwd, foundPath)}`;

                    if (duplicatesCountersMap[name] >= 1) {
                        results.duplicates[`${name} (${duplicatesCountersMap[name]++})`] = foundPath;
                        results.count.duplicates++;
                    } else {
                        results.valid[name] = foundPath;
                        results.count.valid++;
                        duplicatesCountersMap[name] = 1;
                    }
                }, foundPaths);

                return resolve(results);
            } catch (err) {
                reject(errors.enrich(err, `${searchSubjects} collector`));
            }
        }, reject);
    });
}

module.exports = {
    manifests: () => {
        return collect('manifests (package.json)', [
            path.join(cwd, `./package.json`),
            path.join(cwd, `./vendor/spryker/**/assets/package.json`)
        ]);
    },
    extensions: (targetPattern, themePattern) => {
        targetPattern = targetPattern || '';
        themePattern = themePattern || '';

        return collect('extensions', [
            path.join(cwd, `./assets/**/*${targetPattern}*${themePattern}*${context.patterns.extension()}`)
        ], context.patterns.extension());
    },
    entryPoints: (targetPattern, themePattern) => {
        targetPattern = targetPattern || '';

        if (!!themePattern) {
            return collect('entry points', [
                path.join(cwd, `./assets/${targetPattern}/${themePattern}/**/*${context.patterns.entry()}`)
            ], context.patterns.entry());
        }

        return collect('entry points', [
            path.join(cwd, `./assets/${targetPattern}/**/*${context.patterns.entry()}`),
            path.join(cwd, `./vendor/spryker/**/assets/${targetPattern}/**/*${context.patterns.entry()}`)
        ], context.patterns.entry());
    }
};
