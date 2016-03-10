/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let cwd = process.cwd();

module.exports = (id) => {
	let context = module;
    context.id = id;
    context.exports = {};
    context.paths.push(`${cwd}/node_modules`);
    return context;
}
