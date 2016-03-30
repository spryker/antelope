/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let webpack = require('webpack');
let context = require('../context');
let errors = require('../errors');
let cwd = process.cwd();
let watching = false;

module.exports = {
    build: (config) => {
        return new Promise((resolve, reject) => {
            console.error('- building assets using webpack...'.gray);

            webpack(config, function(err, stats, eee) {
                let withWarnings = false;
                let withErrors = false;
                let withModuleNotFound = false;

                try {
                    if (err) {
                        throw errors.enrich(err, 'webpack');
                    }

                    if (!!stats.compilation.errors && stats.compilation.errors.length > 0) {
                        withErrors = true;
                        R.forEach(function(compilationErr) {
                            withModuleNotFound = (compilationErr.name === 'ModuleNotFoundError');
                            console.error('  - %s'.red, compilationErr);
                        }, stats.compilation.errors);

                        if (!config.watch) {
                            throw errors.enrich(new Error('CompilationError'), 'assets compilation');
                        }
                    }

                    if (!!stats.compilation.fileDependencies) {
                        console.log('  - built:'.gray, `${stats.compilation.fileDependencies.length}`.green);

                        if (context.has('debug') && stats.compilation.fileDependencies.length > 0) {
                            R.forEach(function(file) {
                                console.log('    -'.gray, `${path.relative(cwd, file)}`.magenta);
                            }, stats.compilation.fileDependencies);
                        }
                    }

                    if (!!stats.compilation.missingDependencies) {
                        console.warn('  - missing:'.gray, `${stats.compilation.missingDependencies.length}`.yellow);

                        if (stats.compilation.missingDependencies.length) {
                            withWarnings = true;
                            R.forEach(function(file) {
                                console.warn(`    - ${path.relative(cwd, file)}`.yellow);
                            }, stats.compilation.missingDependencies);
                        }
                    }

                    if (withErrors) {
                        console.error('- build failed'.gray, 'due to errors'.red);

                        if (withModuleNotFound) {
                            console.error('  [!] something is missing: did you run'.red, 'antelope install', 'before building?'.red);
                            console.error('      if you did, then it may be a typo...'.red);
                        }
                    } else if (withWarnings) {
                        console.warn('- build completed'.gray, 'with some warning'.yellow);
                    } else {
                        console.log('- build completed'.gray, 'successfully'.green, 'in'.gray, `${(stats.endTime - stats.startTime) / 1000}`.cyan, 'seconds'.gray);
                    }
                } catch (err) {
                    reject(errors.enrich(err, 'compilation report'));
                }

                if (config.watch) {
                    if (watching) {
                        console.log('\n- still watching...'.cyan);
                    } else {
                        watching = true;
                        console.log('- watching assets for changes...'.cyan, '[Ctrl+C to quite]'.gray);
                    }
                } else {
                    return resolve();
                }
            });
        });
    }
};
