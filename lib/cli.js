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
let test = require('./test');
let automation = require('./automation');
// let licenses = require('./licenses');
let provider = require('./provider');
let pkg = require('../package.json');
let cwd = process.cwd();
let start = new Date().getTime();

function printInfo() {
    console.info(`\n${pkg.name.toUpperCase()}`.bold, `(${pkg.version})`);
    console.info(`${pkg.description}`);
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
    console.info('\nSettings'.bold.grey);
    console.info('- project root (cwd):'.grey, cwd.magenta);

    install.run().then(() => {
        console.info('\nInstallation completed'.gray, 'succesfully'.green);
        return exitAndLog();
    }).catch((err) => {
        return exitAndLog(errors.log('install', err));
    });
}

function runTest(options) {
    context.init('test', options);

    printInfo();
    console.info('\nSettings'.bold.grey);
    console.info('- project root (cwd):'.grey, cwd.magenta);

    test.full().then(() => {
        console.info('\nTest completed'.gray, 'succesfully'.green);
        return exitAndLog();
    }).catch((err) => {
        return exitAndLog(errors.log('test', err));
    });
}

function runAutomation(target, options) {
    let automationPromise;

    context.init(target || 'all', options);
    printInfo();

    if (!context.hasTarget()) {
        console.info('\n[!] No valid target application specified (yves, zed)'.yellow);
        console.info('\nFor help using this tool, run:'.grey);
        console.info(`${pkg.name} --help`.grey);
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

    console.info('\nSettings'.bold.grey);
    console.info('- project root (cwd):'.grey, cwd.magenta);
    console.info('- target:'.grey, context.output.target().cyan);

    if (context.isAll() || context.isYves()) {
        console.info('- theme:'.grey, context.output.theme().cyan);
    }

    console.info('- mode:'.grey, context.output.mode().cyan);
    console.info('- watch:'.grey, `${context.has('watch')}`.cyan);

    if (context.has('debug')) {
        automationPromise = test.full().then(() => {
            return automation.run();
        });
    } else {
        automationPromise = test.base().then(() => {
            return automation.run();
        });
    }

    automationPromise.then(() => {
        return exitAndLog();
    }).catch((err) => {
        return exitAndLog(errors.log('automation', err));
    });
}

// function runLicensesCrawler(options) {
//     context.init('licenses', options);

//     if (!context.isLicensesPrinting()) {
//         printInfo();
//         console.info('\nLicenses'.bold.gray);
//         console.info('Search for external modules licenses'.gray);
//         console.info('-'.gray, 'green'.green, 'is for found and declared licenses'.gray);
//         console.info('-'.gray, 'yellow'.yellow, 'is for found but not declared licenses, or viceversa'.gray);
//         console.info('-'.gray, 'red'.red, 'is for unknown licenses\n'.gray);
//     }

//     licenses.find().then(() => {
//         if (context.isLicensesPrinting()) {
//             return exit(0);
//         }

//         return exitAndLog();
//     }).catch((err) => {
//         return exitAndLog(errors.log('licenses', err));
//     });
// }

function runProvider(options) {
    context.init('provider', options);

    printInfo();
    console.info('\nProvider'.bold.gray);
    console.info('Show provided modules available in YVES and ZED custom configurations'.gray, '\n');
    provider.show();

    return exitAndLog();
}

commander
    .on('--help', () => {
        console.log(`  Run 'antelope <command> --help' to output command specific usage information`);
    });

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
    .option('--production', 'enable the production mode')
    .action(runAutomation);

// commander
//     .command('licenses')
//     .description('Crowl through the project and output all npm modules licenses')
//     .option('-m, --manifest', 'export the license manifest content (where available)')
//     .option('-j, --json', 'output a json formatted list of licenses')
//     .option('-c, --csv', 'output a csv formatted table of licenses')
//     .option('-s, --separator', 'define the csv separator char (default is ;)')
//     .action(runLicensesCrawler)
//     .on('--help', () => {
//         console.log(`  Follow these tips if you want to to write licenses into a file:`, '\n');
//         console.log(`    $ antelope licenses --json > json_filename.json`);
//         console.log(`    $ antelope licenses --manifest --csv > csv_filename.csv`, '\n');
//     });

// commander
//     .command('provider')
//     .description('Output all the modules Antelope provide internally')
//     .action(runProvider);

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
