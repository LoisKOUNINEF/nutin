import path from 'path';
import * as fsExtra from 'fs-extra';
import { CONFLICT_MARKER } from './three-way-merge.mjs';

const fs = fsExtra.default;
export const REPORT_FILE_NAME = 'NUTIN-UPDATE-REPORT.md';

const list = (items, describe = ({ relPath }) => `\`${relPath}\``) => items.map((item) => `- ${describe(item)}`).join('\n');

// Lists the files you edited that this update touched. No diffs: merged files hold both versions'
// changes, and overlaps are marked in the files themselves.
export async function writeUpdateReport(projectPath, { merged, conflicted, binaryConflicts }, oldVersion, newVersion) {
  const sections = [
    `# nutin-update report\n\nUpdate from nutin v${oldVersion} to v${newVersion}. These files had changes of yours and changes in the new nutin version.`,
  ];

  if (conflicted.length > 0) {
    sections.push(
      '## Conflicts to resolve\n\n' +
      'Your edits and nutin\'s overlap in these files. **The project won\'t build until they\'re resolved.** ' +
      `Each conflict is marked in the file: \`${CONFLICT_MARKER}\` starts your version, \`||||||| nutin v${oldVersion}\` ` +
      `the original one, \`=======\` the new one, ending at \`>>>>>>> nutin v${newVersion}\`. ` +
      'Keep what you need, delete the markers, then run nutin-update again to confirm.\n\n' +
      list(conflicted, ({ relPath, conflictCount }) => `\`${relPath}\` (${conflictCount} conflict${conflictCount > 1 ? 's' : ''})`),
    );
  }

  if (merged.length > 0) {
    sections.push(
      '## Merged automatically\n\nYour edits and the new version\'s changes didn\'t overlap, so both were kept. Review them.\n\n' +
      list(merged),
    );
  }

  if (binaryConflicts.length > 0) {
    sections.push(
      '## Binary files left as they are\n\nThese can\'t be merged: your version was kept. Compare it with the new one manually.\n\n' +
      list(binaryConflicts),
    );
  }

  await fs.writeFile(path.join(projectPath, REPORT_FILE_NAME), sections.join('\n\n') + '\n');
}
