/**
 * This file is part of SPY frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let fs = require('graceful-fs');
let R = require('ramda');
let globby = require('globby');
let context = require('./context');
let errors = require('./errors');
let cwd = process.cwd();

function toCSV(json) {
    let sep = context.get('separator');
    let headers = `Name${sep}Url${sep}License Terms${sep}License Type${sep}Version${sep}Type${sep}Labeling${sep}\n`;

    return R.reduce((output, key) => {
        let pkg = json[key];
        output += `"${key}"${sep}"${pkg.url}"${sep}${sep}"${pkg.license.type}"${sep}"${pkg.version}"${sep}"${pkg.type}"${sep}"${pkg.license.terms}"${sep}\n`;
        return output;
    }, headers, R.keys(json));
}

module.exports = {
    find: () => {
        return new Promise((resolve, reject) => {
            globby([
                '**/package.json',
                '!package.json'
            ], {
                cwd: cwd,
                nocase: true
            }).then((pkgs) => {
                let json = R.reduce((licenses, pkgRelPath) => {
                    try {
                        let pkgPath = path.join(cwd, pkgRelPath);
                        let pkgDir = path.dirname(pkgPath);
                        let pkg = require(pkgPath);

                        let license = {
                            type: '',
                            path: '',
                            terms: '',
                            found: false,
                            declared: false
                        };

                        let termsFiles = globby.sync([
                            '**license*',
                            '**licence*'
                        ], {
                            cwd: pkgDir,
                            nocase: true
                        });

                        R.forEach((termsFile) => {
                            let termsAbsPath = path.join(pkgDir, termsFile);
                            license.path += `${path.relative(cwd, termsAbsPath)}, `;

                            if (context.has('manifest')) {
                                license.terms += `${fs.readFileSync(termsAbsPath, 'utf8')}\n\n`;
                            }
                        }, termsFiles);

                        if (pkg.licenses && pkg.licenses.length > 0) {
                            license.type = R.reduce((type, details) => type + `${details.type} `, '', pkg.licenses).trim();
                            license.declared = !!license.type;
                        } else {
                            license.declared = !!pkg.license;
                            license.type = pkg.license || 'unknown';
                        }

                        license.found = !!license.path;
                        license.path = license.found ? license.path.trim().replace(/,$/, '') : 'not found';

                        licenses[pkg.name] = {
                            type: 'npm',
                            version: pkg.version || 'unknown',
                            url: pkg.homepage,
                            license: license,
                        };

                        return licenses;
                    } catch (err) {
                        throw errors.enrich(err, 'license crawler');
                    }
                }, {}, pkgs);

                if (context.has('json')) {
                    console.info(JSON.stringify(json));
                    return resolve(json);
                }

                if (context.has('csv')) {
                    console.info(toCSV(json));
                    return resolve(json);
                }

                R.forEach((key) => {
                    let pkg = json[key];
                    let licenceType = pkg.license.type.green;

                    if (!pkg.license.declared && pkg.license.found) {
                        licenceType = pkg.license.path.yellow;
                    }

                    if (pkg.license.declared && !pkg.license.found) {
                        licenceType = pkg.license.type.yellow;
                    }

                    if (!pkg.license.declared && !pkg.license.found) {
                        licenceType = pkg.license.type.red;
                    }

                    console.info('-'.gray, key.magenta, pkg.version.cyan, '->'.gray, licenceType);
                }, R.keys(json));

                return resolve(json);
            });
        });
    }
};
