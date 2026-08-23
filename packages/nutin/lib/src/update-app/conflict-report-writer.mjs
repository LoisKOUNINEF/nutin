import path from 'path';
import * as fsExtra from 'fs-extra';
import * as Diff from 'diff';

const fs = fsExtra.default;
const REPORT_FILE_NAME = 'NUTIN-UPDATE-REPORT.md';

export async function writeConflictReport(projectPath, conflicts, oldVersion, newVersion) {
  const sections = conflicts.map(({ relPath, actualContent, newEntry }) => {
    if (newEntry.isBinary || Buffer.isBuffer(actualContent)) {
      return `## ${relPath}\n\nBinary file — differs from both your recorded baseline and the new nutin version. Compare manually.\n`;
    }

    const patch = Diff.createTwoFilesPatch(
      relPath,
      relPath,
      actualContent,
      newEntry.content,
      'yours',
      `nutin v${newVersion}`,
    );
    return `## ${relPath}\n\n\`\`\`diff\n${patch}\`\`\`\n`;
  });

  const header = '# nutin-update report\n\n' +
    `These files changed between nutin v${oldVersion} and v${newVersion}, but you've customized them ` +
    'since generation, so they were left untouched. Review each diff below (yours vs. the new nutin ' +
    'version) and merge by hand.\n\n';

  await fs.writeFile(path.join(projectPath, REPORT_FILE_NAME), header + sections.join('\n'));
}
