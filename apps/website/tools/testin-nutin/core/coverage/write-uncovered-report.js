import fs from 'fs';
import path from 'path';
import { print } from '../printer.js';
import { errorExit } from '../../../utils/index.js';
import config from '#root/nutin.config.js';

const REPORT_PATH = path.join('coverage', 'uncovered.md');

export async function maybeWriteUncoveredReport(report) {
  const uncovered = report.filter(r => r.uncoveredLines.length || r.uncoveredBranches.length || r.uncoveredFunctions.length);
  if (!uncovered.length) {
    print.info('🎉 No uncovered code found.\n');
    return;
  }

  if (!config.testinNutin.coverage.reportUncovered) return;

  try {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, buildMarkdown(uncovered));
  } catch (err) {
    errorExit(err, 'coverage/write-uncovered-report');
  }
  print.info(`Wrote ${REPORT_PATH}\n`);
}

function buildMarkdown(uncovered) {
  const sections = uncovered
    .sort((a, b) => a.file.localeCompare(b.file))
    .map(r => {
      const branches = r.uncoveredBranches.length
        ? `Uncovered branches (lines): ${r.uncoveredBranches.join(', ')}\n`
        : '';
      const fns = r.uncoveredFunctions.length
        ? `Uncovered functions:\n${r.uncoveredFunctions.map(f => `- \`${f.name}\` (line ${f.line})`).join('\n')}\n`
        : '';
      const lines = r.uncoveredLines.length
        ? `Uncovered lines: ${r.uncoveredLines.join(', ')}\n`
        : '';
      return `## ${r.file}\n\n${branches}${fns}${lines}`;
    });

  return `# Uncovered Code\n\nIMPORTANT: Line numbers refer to **compiled** .js code (\`dist/src/\`).\n\n${sections.join('\n')}`;
}
