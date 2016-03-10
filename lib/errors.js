/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let R = require('ramda');

let errors = {
    licenses: {
        name: 'License crawler error',
        description: 'Something went wrong during licenses crawl'
    },
    test: {
        name: 'Test error'
    },
    automation: {
        name: 'Automation error',
        description: 'Something went wrong during automation process'
    },
    watchAllTargets: {
    	name: 'Watch conflict detected',
    	description: 'Cannot enable watch mode for YVES and ZED at the same time'
    },
    watchYvesAllThemes: {
        name: 'Watch conflict detected',
        description: `Cannot enable watch mode for all YVES themes at the same time. Use '-t' or '--theme' to watch over a specific one`
    },
    watchProduction: {
    	name: 'Watch conflict detected',
    	description: 'Cannot enable watch mode in production mode'
    },
    zedTheme: {
        name: 'Argument not allowed',
        description: `'zed' command has no 'theme' argument: ZED application has no themes`
    }
};

let ids = R.keys(errors);

class SpyError {
    constructor(id, exception) {
        this._id = id;
        this._exception = exception || null;
        this._error = errors[id] || {};
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._error.name || `${this._id} [unknown]`;
    }
    get description() {
        return !!this._error.description ? this._error.description : '';
    }
    get code() {
        return R.indexOf(this._id, ids) + 2;
    }
    get exception() {
        return !!this._exception ? this._exception : null;
    }
}

module.exports = {
    log: (id, err) => {
        let error = new SpyError(id, err);

        console.error(`\n[!] ${error.name}: execution aborted (err: ${error.id})`.red);

        if (error.description) {
            console.error(`    ${error.description}`.red);
        }

        if (error.exception) {
            console.error(`    ${error.exception}`.red);

            if (error.exception.info) {
                console.error(`    Trace info: ${error.exception.info}`.red);
            }
        }

        return error.code;
    },
    enrich: (err, info) => {
        err.info = err.info || [];
        err.info.push(info);
        return err;
    }
};
