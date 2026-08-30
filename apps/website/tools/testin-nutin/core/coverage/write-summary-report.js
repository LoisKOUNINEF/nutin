import fs from 'fs';
import path from 'path';
import { print, toTsPath } from '../printer.js';
import { errorExit } from '../../../utils/index.js';
import config from '#root/nutin.config.js';

const REPORT_PATH = path.join('coverage', 'summary.md');

export function writeSummaryReport(report, globals, testResults) {
  if (!report.length) return;

  try {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, buildMarkdown(report, globals, testResults));
  } catch (err) {
    errorExit(err, 'coverage/write-summary-report');
  }
  print.info(`Wrote ${REPORT_PATH}\n`);
}

function buildMarkdown(report, globals, testResults) {
  const rows = report
    .slice()
    .sort((a, b) => a.file.localeCompare(b.file))
    .map(r => `| ${toTsPath(r.file)} | ${r.linesPct.toFixed(1)} | ${r.functionsPct.toFixed(1)} | ${r.branchesPct.toFixed(1)} |`)
    .join('\n');

  const threshold = config.testinNutin.coverage?.threshold;
  const thresholdLine = typeof threshold === 'number' ? `\n- Threshold: ${threshold}%` : '';

  const { todo, passed, failed, elapsedTime } = testResults;
  const total = passed + failed;
  const todoLine = todo > 0 ? `\n- ⚠️ To do: ${todo}` : '';

  return `# Coverage Summary

## Test Summary

- ✓ ${passed} passed
- ✗ ${failed} failed
- 📖 ${total} total
- ⌚️ Time: ${elapsedTime.toFixed(2)}ms${todoLine}

| File | Lines % | Functions % | Branches % |
|---|---|---|---|
${rows}

## Global

- Lines: ${globals.globalLinesPct.toFixed(1)}%
- Functions: ${globals.globalFunctionsPct.toFixed(1)}%
- Branches: ${globals.globalBranchesPct.toFixed(1)}%${thresholdLine}
`;
}
