/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let shell = require('shelljs');
let context = require('./context');
let collector = require('./automation/collector');
let cwd = process.cwd();

module.exports = {
    run: () => {
        let command = 'npm install --no-optional' + (context.has('nosym') ? ' --no-bin-links' : '');
        console.log('Running: '.gray, command.cyan);
        
        return new Promise((resolve, reject) => {
            collector.manifests().then((list) => {
                R.forEach((manifest) => {
                    shell.cd(path.dirname(manifest));
                    shell.exec(command);
                }, R.keys(list.valid));

                shell.cd(cwd);
                resolve();
            }, (err) => reject(err));
        });
    }
};
