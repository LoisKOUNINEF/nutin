#!/usr/bin/env node

import path from 'path';
import { print, isProd, runScript } from '../utils/index.js';

const scriptsDir = path.join(process.cwd(), 'tools', 'builder', 'core');

if (!isProd) print.boldInfo('For production, use build:prod.\n');
print.boldHead(`Starting build...\n`);

runScript(path.join(scriptsDir, 'copy-static.js'), 'Copying files...');

if(!isProd) runScript(path.join(scriptsDir, 'tsc.js'), 'Running TypeScript compiler...');

runScript(path.join(scriptsDir, 'merge-templates.js'), 'Merging HTML templates in temp files...');
runScript(path.join(scriptsDir, 'build-i18n.js'), 'Combining locales for production...');
runScript(path.join(scriptsDir, 'sass.js'), 'Compiling styles from main.scss...');
runScript(path.join(scriptsDir, 'validate-html.js'), 'Adding and validating tags in index.html...');

if (isProd) {
	runScript(path.join(scriptsDir, 'esbuild.js'), 'Running esbuild...');
	runScript(path.join(scriptsDir, 'hash-files.js'), 'Hashing files...');
	runScript(path.join(scriptsDir, 'compress-files.js'), 'Compressing files...');
}

runScript(path.join(scriptsDir, 'finalize-build.js'), 'Finalizing build...')

print.boldSuccess(`\nBuild successful!\n`);

if (!isProd) print.boldInfo('For production, use build:prod.');
