import { print, chalk } from '../../utils/index.js';
import config from '#root/nutin.config.js';

export { chalk, print } from '../../utils/index.js';

export function printSummary(todo, passed, failed, time) {
  const totalTime = time.toFixed(2);
  const total = passed + failed;

  if (todo > 0) print.boldWarn(`\n⚠️ To do: ${todo}\n`);

  print.boldBlue(`Test Summary`);
  print.boldInfo(`✓ ${passed} passed`);
  print.boldError(`✗ ${failed} failed`);
  print.info(`📖 ${total} total`);
  print.info(`⌚️ Time: ${totalTime}ms \n`);
}

export function printResults(results) {
  const statusOrder = { passed: 0, todo: 1, failed: 2 };
  const sortedResults = results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  sortedResults.forEach(result => {
    if (result.status === 'passed') {
      if (config.testinNutin.verbose ) console.log(`${chalk.green('✓')} ${chalk.cyan(`${result.suiteName}`)} - ${chalk.green(`${result.name}`)}`);
    } else if (result.status === 'todo') {
      print.warn(`TODO: ${result.name} in ${toTsPath(result.file)}`);
    } else {
      print.error(`✗ ${result.suiteName} - ${result.name}`);
      print.grayError(result.error);
    }
  });
}

export function printStart() {
  print.boldHead('\nRunning tests...\n');
}

export function printCoverageReport(report) {
  if (!report.length) {
    print.warn('No app source files were covered.');
    return { globalLinesPct: 100, globalFunctionsPct: 100, globalBranchesPct: 100 };
  }

  print.boldBlue('\nCoverage Summary');
  console.table(
    report
      .sort((a, b) => a.file.localeCompare(b.file))
      .map(r => ({
        File: toTsPath(r.file),
        'Lines %': r.linesPct.toFixed(1),
        'Functions %': r.functionsPct.toFixed(1),
        'Branches %': r.branchesPct.toFixed(1),
      }))
  );

  const totals = report.reduce((acc, r) => ({
    coveredLines: acc.coveredLines + r.coveredLines,
    totalLines: acc.totalLines + r.totalLines,
    coveredBranches: acc.coveredBranches + r.coveredBranches,
    totalBranches: acc.totalBranches + r.totalBranches,
    coveredFunctions: acc.coveredFunctions + r.coveredFunctions,
    totalFunctions: acc.totalFunctions + r.totalFunctions,
  }), { coveredLines: 0, totalLines: 0, coveredBranches: 0, totalBranches: 0, coveredFunctions: 0, totalFunctions: 0 });

  const globalLinesPct = totals.totalLines ? (totals.coveredLines / totals.totalLines) * 100 : 100;
  const globalFunctionsPct = totals.totalFunctions ? (totals.coveredFunctions / totals.totalFunctions) * 100 : 100;
  const globalBranchesPct = totals.totalBranches ? (totals.coveredBranches / totals.totalBranches) * 100 : 100;

  const threshold = config.testinNutin.coverage?.threshold;
  const thresholdSuffix = typeof threshold === 'number' ? `  (threshold: ${threshold}%)` : '';
  print.boldInfo(`Global:  ${globalBranchesPct.toFixed(1)}% branches, ${globalFunctionsPct.toFixed(1)}% functions, ${globalLinesPct.toFixed(1)}% lines${thresholdSuffix}\n`);

  return { globalLinesPct, globalFunctionsPct, globalBranchesPct };
}

export function toTsPath(input) {
  return input
    .split('/')
    .slice(1)
    .join('/')
    .replace(/\.js$/, '.ts');
}

