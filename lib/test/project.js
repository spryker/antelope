/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let fs = require('graceful-fs');
let errors = require('../errors');
let cwd = process.cwd();

module.exports = {
    run: () => {
        return new Promise((resolve, reject) => {
            console.log('\nProject test'.bold.gray);
            console.log('Check for current workin directory'.gray);
            console.log('You must run antelope from project root folder'.gray);
            console.log('|'.gray);

            fs.stat(`${cwd}/public`, (err, stats) => {
                if (err) {
                    console.error('|'.gray, `[!] It seems that you are not in the project root folder...`.red);
                    return reject(errors.enrich(new Error("Antelope is running from the wrong folder: run it again from the root folder of your project."), 'project test'));
                } else {
                    console.log('| Check completed'.gray, 'successfully'.green);
                    return resolve();
                }
            });
        });
    }
};
