#!/usr/bin/env node

import path from 'path';
import { print, isProd, runScript } from '../utils/index.js';

const scriptsDir = path.join(process.cwd(),'tools', 'builder', 'core');

print.boldHead(`Starting build...\n`);

runScript(path.join(scriptsDir, 'copy-static.js'), 'Copying files...');

if(!isProd) runScript(path.join(scriptsDir, 'tsc.js'), 'Running TypeScript compiler...');

runScript(path.join(scriptsDir, 'merge-templates.js'), 'Merging HTML templates in temp files...');
runScript(path.join(scriptsDir, 'build-i18n.js'), 'Combining locales for production...');
runScript(path.join(scriptsDir, 'sass.config.js'), 'Compiling styles from main.scss...');
runScript(path.join(scriptsDir, 'validate-html.js'), 'Validating tags in index.html...');

if (isProd) runScript(path.join(scriptsDir, 'esbuild.js'), 'Running esbuild...');

runScript(path.join(scriptsDir, 'finalize-build.js'), 'Finalizing build...')

print.boldSuccess(`\nBuild successful!\n`);
