/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let errors = require('../errors');
let cwd = process.cwd();

module.exports = {
    run: () => {
        return new Promise((resolve, reject) => {
            console.log('\nManifest test'.bold.gray);
            console.log('Check for package.json in cwd'.gray);
            console.log('|'.gray);

            try {
                let projectPkg = require(path.join(cwd, './package.json'));
                console.log('| Manifest found:'.gray, `${projectPkg.name || 'no name'} (${projectPkg.version || 'no version'})`.cyan);

                return resolve();
            } catch (err) {
                console.error('|'.gray, `[!] No manifest found`.red);
                console.error('|'.gray, '    Run'.red, 'npm init', 'to create a new one'.red);

                throw errors.enrich(err, 'manifest test');
            }
        });
    }
};
