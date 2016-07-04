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
let configurator = require('./automation/webpack');
let collector = require('./automation/collector');
let provider = require('./automation/provider');
let compiler = require('./automation/compiler');
let themes = require('./automation/themes');
let cwd = process.cwd();

function automation(target, targetPattern, theme) {
    console.log(`\n${target.toUpperCase()}`.bold.gray);

    if (!!theme) {
        console.log(`${theme.toUpperCase()} theme`.gray);
    }

    console.log('- collecting data...'.gray);

    return new Promise((resolve, reject) => {
        return Promise.all([
            collector.entryPoints(targetPattern, theme),
            collector.extensions(targetPattern, theme),
            collector.manifests()
        ]).then((results) => {
            let entryPoints = results[0];
            let extensions = results[1];
            let manifests = results[2];
            let config = {};

            function skip(message) {
                console.warn('- build'.gray, 'skipped'.yellow, message.gray);
                resolve();
            }

            function compile() {
                compiler.build(config).then(resolve, reject);
            }

            console.log(`  ${String.fromCharCode(0x2517)} entry points:`.gray,
                `${entryPoints.count.valid} valid`.green,
                '|'.gray,
                `${entryPoints.count.duplicates} duplicates`.yellow,
                '|'.gray,
                `${entryPoints.count.total} total`.cyan);

            try {
                if (extensions.count.valid > 0) {
                    config = R.keys(extensions.valid).reduce((baseConfig, key) => {
                        try {
                            console.log(`  ${String.fromCharCode(0x2517)} configuration:`.gray, extensions.valid[key].magenta);

                            let partial = provider.import(path.join(cwd, extensions.valid[key]), entryPoints.valid, manifests.valid);

                            if (typeof(partial) === 'function') {
                                return partial(baseConfig);
                            }

                            return Object.assign(configurator.getDefault(), partial);
                        } catch (err) {
                            console.error('- build'.gray, 'aborted'.red);
                            reject(errors.enrich(err, `${key} configuration contains errors`));
                        }
                    }, configurator.getDefault());

                    // LEGACY
                    if (context.has('legacy') && target === 'yves') {
                        config = R.merge(configurator.legacy.yves(entryPoints.valid, manifests.valid), extension);
                    }
                    // END LEGACY

                    if (!config) {
                        throw new Error('undefined/null/invalid configuration returned');
                    } else {
                        if (config.antelope && config.antelope.disabled) {
                            skip('by configuration');
                        } else {
                            compile();
                        }
                    }
                } else {
                    // LEGACY
                    if (context.has('legacy') && target === 'zed') {
                        config = configurator.legacy.zed(entryPoints.valid, manifests.valid);
                        compile();
                    } else {
                        if (target === 'zed') {
                            console.warn('\n[!] Zed missing configuration may be caused by antelope v2'.yellow);
                            console.warn('    Run this tool using'.yellow, '-l', 'flag to provide legacy for v1 projects'.yellow, '\n');
                        }
                        // END LEGACY

                        skip('due to missing configuration');
                    }
                }
            } catch (err) {
                console.error('- build'.gray, 'aborted'.red);
                reject(err);
            }
        }, reject);
    });
}

module.exports = {
    run: () => {
        let targetPatterns = context.patterns.target();
        let themePatterns = context.patterns.theme();

        function processYves() {
            return R.reduce((promise, theme) => {
                return promise.then(() => {
                    return automation('yves', targetPatterns.yves, theme);
                });
            }, Promise.resolve(), themes.getFromPattern(themePatterns.yves));
        }

        function processZed() {
            return automation('zed', targetPatterns.zed);
        }

        if (context.isAll()) {
            return processYves().then(processZed);
        }

        if (context.isYves()) {
            return processYves();
        }

        if (context.isZed()) {
            return processZed();
        }
    }
};
