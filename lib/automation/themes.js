/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let R = require('ramda');
let fs = require('graceful-fs');
let yvesThemesPath = `${process.cwd()}/assets/Yves`;

function getThemes(){
    return R.filter((name) => {
        try {
            return fs.statSync(`${yvesThemesPath}/${name}`).isDirectory();
        } catch (err) {
            return false;
        }
    }, fs.readdirSync(yvesThemesPath));
}

module.exports = {
    all: () => getThemes(),
    getFromPattern: (pattern) => {
    	if (!pattern) {
    		return [];
    	}

    	if (pattern === '*') {
    		return getThemes();
    	}

    	return R.filter((theme) => {
    		return theme === pattern;
    	}, getThemes());
    }
}
