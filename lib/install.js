/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let shell = require('shelljs');
let collector = require('./automation/collector');
let cwd = process.cwd();

module.exports = {
    run: () => {
        return new Promise((resolve, reject) => {
            collector.manifests().then((list) => {
                R.forEach((manifest) => {
                    shell.cd(path.dirname(manifest));
                    shell.exec(`npm install`);
                }, R.keys(list.valid));

                shell.cd(cwd);
                resolve();
            }, (err) => reject(err));
        });
    }
};
