import path from 'path';
import {
  registerTestGlobals, getTestFiles, runQueuedTests, setCurrentTestFile, print,
  startCoverage, stopCoverage, buildCoverageReport, printCoverageReport, maybeWriteUncoveredReport,
  writeSummaryReport, setupJsdom, teardownJsdom,
} from './core/index.js';
import config from '#root/nutin.config.js';

const args = process.argv.slice(2);
const coverageEnabled = args.includes('--coverage') || Boolean(config.testinNutin.coverage?.enabled);
const verboseEnabled = args.includes('--verbose');
const fileFilters = args.filter(arg => arg !== '--coverage' && arg !== '--verbose');

// Tests import and run the compiled build output (dist/src/)
// and has no sourcemap back to the .ts sources
const origins = [];
const coverageDirs = [];

if (config.testinNutin.includeFramework) {
  const frameworkDir = path.join('src', 'core');
  origins.push(frameworkDir);
  if (coverageEnabled) coverageDirs.push(path.join('dist', frameworkDir));
}

if (config.testinNutin.includeApp) {
  const appDir = path.join('src', 'app');
  origins.push(appDir);
  if (coverageEnabled) coverageDirs.push(path.join('dist', appDir));
}

if (config.testinNutin.includeTools) origins.push('tools');

registerTestGlobals();

let testFiles = origins.flatMap(
  origin => getTestFiles(path.join('..', origin))
);

if (fileFilters.length) {
  testFiles = testFiles.filter(file => fileFilters.some(f => file.includes(f)));
}

async function loadTestFile(file) {
  setupJsdom();
  setCurrentTestFile(file);
  await import(file);
  teardownJsdom();
}

async function runCoverage(testResults) {
  let scopedResults = await stopCoverage(coverageDirs);
  if (fileFilters.length) {
    scopedResults = scopedResults.filter(({ filePath }) => fileFilters.some(f => filePath.includes(f)));
  }
  const report = buildCoverageReport(scopedResults);
  const globals = printCoverageReport(report);
  writeSummaryReport(report, globals, testResults);
  await maybeWriteUncoveredReport(report);

  const threshold = config.testinNutin.coverage?.threshold;
  if (typeof threshold === 'number') {
    const misses = Object.entries({
      lines: globals.globalLinesPct,
      functions: globals.globalFunctionsPct,
      branches: globals.globalBranchesPct,
    }).filter(([, pct]) => pct < threshold);

    if (misses.length) {
      print.boldError(`\n✗ Coverage below threshold (${threshold}%): ${misses.map(([k, pct]) => `${k} ${pct.toFixed(1)}%`).join(', ')}\n`);
      process.exit(1);
    }
  }
}

async function runTests() {
  if (verboseEnabled) print.head('Test suites :');

  if (coverageEnabled) await startCoverage();

  for (const file of testFiles) {
    try {
      await loadTestFile(file);
    } catch (error) {
      print.boldError(`✗ ${file} failed to load:`);
      print.grayError(error.stack);
    }
  }

  const testResults = await runQueuedTests();

  if (testResults.failed > 0) process.exitCode = 1;

  if (coverageEnabled) await runCoverage(testResults);
}

runTests().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  print.grayError(err.stack);
  process.exitCode = 1;
});
