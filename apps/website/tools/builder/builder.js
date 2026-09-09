#!/usr/bin/env node

import path from 'path';
import { print, runScript, acquireBuildLock } from '../utils/index.js';
import { builderConfig } from './builder.config.js';

// Must happen before copy-static.js wipes/recreates dist-build — a second build
// starting mid-run (a manual build, another dev watcher instance, ...) would
// otherwise race it. See tools/utils/build-lock.js.
await acquireBuildLock();

const scriptsDir = path.join(process.cwd(), 'tools', 'builder', 'core');

print.boldHead(`\nStarting build...`);

runScript(path.join(scriptsDir, 'app', 'copy-static.js'), 'Copying files...');

runScript(path.join(scriptsDir, 'docs', 'generate-docs.js'), 'Generating resource manifests...');

runScript(path.join(scriptsDir, 'html-index', 'validate-html.js'), 'Processing index.html...');
runScript(path.join(scriptsDir, 'app', 'validate-routes.js'), 'Validating app routes...');

runScript(path.join(scriptsDir, 'app', 'compile-ts.js'), 'Compiling TypeScript...');

runScript(path.join(scriptsDir, 'html-templates', 'process-html-templates.js'), 'Processing HTML templates...');

runScript(path.join(scriptsDir, 'styles', 'sass.js'), 'Compiling styles...');
if (builderConfig.tailwind) runScript(path.join(scriptsDir, 'styles', 'tailwind.js'), 'Compiling Tailwind CSS...');

if (builderConfig.i18n) runScript(path.join(scriptsDir, 'i18n', 'build-i18n.js'), 'Combining locales...');

if (builderConfig.isProd) {
	runScript(path.join(scriptsDir, 'prod-bundle', 'esbuild.js'), 'Running esbuild...');
	runScript(path.join(scriptsDir, 'prod-bundle', 'hash-files.js'), 'Hashing files...');
	runScript(path.join(scriptsDir, 'prod-bundle', 'compress-files.js'), 'Compressing files...');
	if (builderConfig.generateSEO) runScript(path.join(scriptsDir, 'seo', 'generate-seo-files.js'), 'Generating SEO Files...');
}

runScript(path.join(scriptsDir, 'finalize-build.js'), 'Finalizing build...')

print.boldSuccess(`\nBuild successful!\n`);

if (!builderConfig.isProd) print.info('For production, use "npm run build:prod"');
