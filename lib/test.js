/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

// let manifestTest = require('./test/manifest');
// let dependencyTest = require('./test/dependency');
let collectorTest = require('./test/collector');

module.exports = {
    base: () => {
        return Promise.resolve();
    },
    full: () => {
    	return collectorTest.run();
    }
};
