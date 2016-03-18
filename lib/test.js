/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let projectTest = require('./test/project');
let collectorTest = require('./test/collector');

module.exports = {
    base: () => {
        return projectTest.run();
    },
    full: () => {
    	return projectTest.run()
    		.then(collectorTest.run);
    }
};
