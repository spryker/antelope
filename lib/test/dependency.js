/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let path = require('path');
let R = require('ramda');
let context = require('../context');
let errors = require('../errors');
let cwd = process.cwd();
let antelopePkg = require('../../package.json');

function performAnalysis(targetDependencies, projectDependencies) {
    return R.map((dependencyName) => {
        return {
            name: dependencyName,
            isMissing: !projectDependencies[dependencyName],
            isDiverged: projectDependencies[dependencyName] != targetDependencies[dependencyName],
            current: projectDependencies[dependencyName],
            recommended: targetDependencies[dependencyName],
        };
    }, R.keys(targetDependencies));
}

function log(target, dependencies) {
    let missingDependencies = false;
    let divergedDependencies = false;

    console.log('|'.gray);
    console.log(`| ${target}:`.gray, `${dependencies.length}`.cyan);

    R.forEach((dependency) => {
        if (dependency.isMissing) {
            missingDependencies = true;
            console.warn(`| - ${dependency.name}:`.gray, `missing (${dependency.recommended} needed)`.red);
        } else if (dependency.isDiverged) {
            divergedDependencies = true;
            console.log(`| - ${dependency.name}:`.gray, `${dependency.current}`.yellow, `(${dependency.recommended} recommended)`.gray);
        } else {
            console.log(`| - ${dependency.name}:`.gray, `${dependency.current}`.green);
        }
    }, dependencies);

    if (missingDependencies || divergedDependencies) {
        console.log('|'.gray);

        if (missingDependencies) {
            console.error('|'.gray, `[!] Fix missing dependencies or ${target} may not work properly`.red);
        }

        if (divergedDependencies) {
            console.warn('|'.gray, `[!] Check diverged dependencies compatibility to avoid ${target} misbehaviours`.yellow);
        }
    }
}

module.exports = {
    run: () => {
        return new Promise((resolve, reject) => {
            try {
                console.log('\nDependency test'.bold.gray);
                console.log('Requirements analysis on mandatory dependencies'.gray);
                console.log('Custom dependencies will be ignored'.gray);

                let projectPkg = require(path.join(cwd, './package.json'));
                let yvesDependencies = performAnalysis(antelopePkg.yvesDependencies, projectPkg.dependencies);
                let zedDependencies = performAnalysis(antelopePkg.zedDependencies, projectPkg.dependencies);

                log('YVES', yvesDependencies);
                log('ZED', zedDependencies);

                return resolve();
            } catch (err) {
                throw errors.enrich(err, 'dependency test');
            }
        });
    }
};
