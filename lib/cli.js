/**
 * This file is part of Antelope frontend automation tool
 * (c) Spryker Systems GmbH
 * For full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */

'use strict';

let commander = require('commander');
let exit = require('exit');
let context = require('./context');
let errors = require('./errors');
let install = require('./install');
let automation = require('./automation');
let test = require('./test');
let versionTest = require('./test/version');
let pkg = require('../package.json');
let cwd = process.cwd();
let start = new Date().getTime();

function printInfo() {
    console.log(`\n${pkg.name.toUpperCase()}`.bold, `(${pkg.version})`);
    console.log(`${pkg.description}`);
}

function exitAndLog(code) {
    let end = new Date().getTime();
    let time = end - start;
    code = code || 0;

    console.log('\nTool executed in'.gray, `${time / 1000}`.cyan, 'seconds | Exit code:'.gray, !code ? '0'.green : `${code}`.red);
    return exit(code);
}

function runInstall(options) {
    context.init('install', options);

    printInfo();
    console.log('\nSettings'.bold.grey);
    console.log('- project root (cwd):'.grey, cwd.magenta);

    test.base().then(() => {
        console.log('\nInstalling npm modules dependencies...'.gray);

        return install.run().then(() => {
            console.log('Installation completed'.gray, 'succesfully'.green);
            return exitAndLog();
        });
    }).catch((err) => {
        return exitAndLog(errors.log('test', err));
    });
}

function runTest(options) {
    context.init('test', options);

    printInfo();
    console.log('\nSettings'.bold.grey);
    console.log('- project root (cwd):'.grey, cwd.magenta);

    test.full().then(() => {
        console.log('\nTest completed'.gray, 'succesfully'.green);
        return exitAndLog();
    }).catch((err) => {
        return exitAndLog(errors.log('test', err));
    });
}

function runPrint(options) {
    context.init('print', options);

    if (context.has('range')) {
        console.log(versionTest.getInfo().range);
    } else {
        printInfo();
    }
}

function runAutomation(target, options) {
    let automationPromise;

    context.init(target || 'all', options);
    printInfo();

    if (!context.hasTarget()) {
        console.log('\n[!] No valid target application specified (yves, zed)'.yellow);
        console.log('\nFor help using this tool, run:'.grey);
        console.log(`${pkg.name} --help`.grey);
        return exitAndLog();
    }

    if (context.errors.watchAllTargets()) {
        return exitAndLog(errors.log('watchAllTargets'));
    }

    if (context.errors.watchYvesAllThemes()) {
        return exitAndLog(errors.log('watchYvesAllThemes'));
    }

    if (context.errors.watchProduction()) {
        return exitAndLog(errors.log('watchProduction'));
    }

    if (context.errors.zedTheme()) {
        return exitAndLog(errors.log('zedTheme'));
    }

    console.log('\nSettings'.bold.grey);
    console.log('- project root (cwd):'.grey, cwd.magenta);
    console.log('- target:'.grey, context.output.target().cyan);

    if (context.isAll() || context.isYves()) {
        console.log('- theme:'.grey, context.output.theme().cyan);
    }

    console.log('- mode:'.grey, context.output.mode().cyan);
    console.log('- watch:'.grey, `${context.has('watch')}`.cyan);

    if (context.has('legacy')){
        console.warn('\n[!] You are running in legacy mode'.yellow);
        console.warn('    Please update your project to antelope v2'.yellow);
    }

    if (context.has('debug')) {
        automationPromise = test.full().then(() => automation.run());
    } else {
        automationPromise = test.base().then(() => automation.run());
    }

    automationPromise.then(() => {
        return exitAndLog();
    }).catch((err) => {
        return exitAndLog(errors.log('automation', err));
    });
}

commander
    .on('--help', () => {
        console.log(`  Run 'antelope <command> --help' to output command specific usage information`);
    });

commander
    .command('print')
    .description('Print out raw tool informations')
    .option('--range', 'Get the compatibility range required by Spryker GUI bundle')
    .action(runPrint);

commander
    .command('install')
    .description('Install all project dependencies')
    .action(runInstall);

commander
    .command('test')
    .description('Perform functionality and project checks')
    .action(runTest);

commander
    .command('build [app]')
    .description('Process target application(s) entry points')
    .option('-t, --theme <theme>', 'YVES only feature: build provided theme assets')
    .option('-w, --watch', 'enable the watch mode over source files')
    .option('-f, --follow', 'follow symlinks when search for extensions and entry points')
    .option('-d, --debug', 'enable the debug mode (output verbosity)')
    .option('-l, --legacy', 'enable legacy mode for antelope v1 projects')
    .option('--production', 'enable the production mode')
    .action(runAutomation);

module.exports = {
    init: () => {
        if (process.argv.length < 3) {
            printInfo();
            commander.outputHelp();
            return exitAndLog();
        }

        commander
            .version(pkg.version)
            .parse(process.argv);
    }
}
