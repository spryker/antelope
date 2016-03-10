/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let R = require('ramda');
let pkg = require('../package.json');

module.exports = {
	show: () => {
		R.forEach((key) => {
			console.log('-'.gray, key.magenta, pkg.dependencies[key].cyan);
		}, R.keys(pkg.dependencies));
	}
}
