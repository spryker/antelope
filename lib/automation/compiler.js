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

module.exports = {
    build: (config) => {
        return new Promise((resolve, reject) => {
            console.error('- building assets using webpack...'.gray);

            webpack(config, function(err, stats) {
                let withWarnings = false;

                try {
                    if (err) {
                        throw errors.enrich(err, 'webpack');
                    }

                    if (!!stats.compilation.errors && stats.compilation.errors.length > 0) {
                        R.forEach(function(compilationErr) {
                            console.error('  - %s'.red, compilationErr);
                        }, stats.compilation.errors);

                        throw errors.enrich(new Error('CompilationError'), 'assets compilation');
                    }

                    if (!!stats.compilation.fileDependencies) {
                        console.info('  - built:'.gray, `${stats.compilation.fileDependencies.length}`.green);

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

                    console.log('- build completed'.gray, (withWarnings ? 'with some warning'.yellow : 'successfully'.green));
                } catch (err) {
                    reject(errors.enrich(err, 'compilation report'));
                }

                if (config.watch) {
                    console.info('- watching assets for changes...'.cyan, '[Ctrl+C to quite]'.gray);
                } else {
                    return resolve();
                }
            });
        });
    }
};
