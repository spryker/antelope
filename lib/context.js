/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let cwd = process.cwd();
let command = '';
let options = {};
let args = [];

const ENTRY_PATTERN = '.entry.js';
const EXTENSION_PATTERN = '.antelope.js';
const YVES_DEFAULT_PATTERN = 'Yves';
const ZED_DEFAULT_PATTERN = 'Zed';

function is(cmd) {
    return command === cmd;
}

module.exports = {
    init: (cmd, opts) => {
        command = cmd || '';
        options = R.clone(opts || {});
    },
    isAll: () => is('all'),
    isYves: () => is('yves'),
    isZed: () => is('zed'),
    isLicenses: () => is('licenses'),
    isLicensesPrinting: () => is('licenses') && (options.json || options.csv),
    isTest: () => is('test'),
    options: () => R.clone(options),
    set: (name, value) => options[name] = value,
    get: (name) => options[name] || null,
    has: (name) => !!options[name],
    hasTarget: () => is('all') || is('yves') || is('zed'),
    output: {
        mode: () => (!!options.production ? 'production' : 'development') + (!!options.debug ? ' (debug)' : ''),
        target: () => {
            let output = command || 'none';

            switch (command) {
                case 'all':
                    return 'YVES and ZED';
                default:
                    return output.toUpperCase();
            }
        },
        theme: () => {
            switch (command) {
                case 'all':
                    return options.theme || 'all';
                case 'yves':
                    return options.theme || 'all';
                case 'zed':
                    return 'none';
                default:
                    return '';
            }
        }
    },
    patterns: {
        entry: () => ENTRY_PATTERN,
        extension: () => EXTENSION_PATTERN,
        defaultYves: () => YVES_DEFAULT_PATTERN,
        defaultZed: () => ZED_DEFAULT_PATTERN,
        target: () => {
            return {
                yves: is('yves') || is('all') ? YVES_DEFAULT_PATTERN : null,
                zed: is('zed') || is('all') ? ZED_DEFAULT_PATTERN : null
            };
        },
        theme: () => {
            return {
                yves: is('yves') || is('all') ? (options.theme || '*') : '*',
                zed: null
            };
        }
    },
    errors: {
        watchAllTargets: () => is('all') && !!options.watch,
        watchYvesAllThemes: () => is('yves') && !!options.watch && !options.theme,
        watchProduction: () => !!options.watch && !!options.production,
        zedTheme: () => is('zed') && !!options.theme
    }
};
