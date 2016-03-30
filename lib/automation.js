/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let context = require('./context');
let errors = require('./errors');
let collector = require('./automation/collector');
let provider = require('./automation/provider');
let compiler = require('./automation/compiler');
let themes = require('./automation/themes');
let cwd = process.cwd();

function processAssets(targetConfigName, configurator, targetPattern, theme) {
    return new Promise((resolve, reject) => {
        return Promise.all([
            collector.entryPoints(targetPattern, theme),
            collector.extensions(targetPattern, theme),
            collector.manifests()
        ]).then((results) => {
            let entryPoints = results[0];
            let extensions = results[1];
            let manifests = results[2];
            let defaultConfig;
            let config;

            console.log(`\n${targetConfigName.toUpperCase()}`.bold.gray);

            if (!!theme) {
                console.log(`${theme.toUpperCase()} theme`.gray);
            }

            console.log(`- entry points:`.gray,
                `${entryPoints.count.valid} valid`.green,
                '|'.gray,
                `${entryPoints.count.duplicates} duplicates`.yellow,
                '|'.gray,
                `${entryPoints.count.total} total`.cyan);

            try {
                defaultConfig = configurator.load(entryPoints.valid, manifests.valid);
            } catch (err) {
                reject(errors.enrich(err, 'loading default configuration'));
            }

            if (extensions.count.valid > 0) {
                if (extensions.count.valid > 1) {
                    console.log('- warning: more than one extension for the same application/theme - first will be processed, the others ignored'.yellow);
                }

                try {
                    let extensionName = R.keys(extensions.valid)[0];
                    let extension = provider.import(path.join(cwd, extensions.valid[extensionName]));
                    config = R.merge(defaultConfig, extension);

                    if (!config) {
                        reject(errors.enrich(new Error('undefined/null/invalid configuration extension returned'), 'extending configuration'));
                    }

                    console.log('- custom configuration loaded:'.gray, extensions.valid[extensionName].magenta);
                } catch (extensionErr) {
                    config = R.clone(defaultConfig);
                    console.error('- custom configuration ignored due to error: %s'.red, extensionErr);
                }

                if (context.has('debug')) {
                    provider.report();
                }
            } else {
                config = R.clone(defaultConfig);
                console.log('- default configuration loaded'.gray);
            }

            if (config.antelope && config.antelope.disabled) {
                console.log('- build'.gray, 'disabled'.yellow, 'by config'.gray);
                resolve();
            } else {
                compiler.build(config).then(resolve, reject);
            }
        }, reject);
    });
}

function automation(targetConfigName, targetPattern, themePattern) {
    let configurator = require(`./webpack/configs/${targetConfigName}.js`);

    if (targetConfigName === 'zed') {
        return processAssets(targetConfigName, configurator, targetPattern, themePattern);
    }

    return R.reduce((promise, theme) => {
        return promise.then(() => {
            return processAssets(targetConfigName, configurator, targetPattern, theme);
        });
    }, Promise.resolve(), themes.getFromPattern(themePattern));
}

module.exports = {
    run: () => {
        let targetPatterns = context.patterns.target();
        let themePatterns = context.patterns.theme();

        if (context.isAll()) {
            return automation('yves', targetPatterns.yves, themePatterns.yves).then(() => {
                return automation('zed', targetPatterns.zed);
            });
        }

        if (context.isYves()) {
            return automation('yves', targetPatterns.yves, themePatterns.yves);
        }

        if (context.isZed()) {
            return automation('zed', targetPatterns.zed);
        }
    }
};
