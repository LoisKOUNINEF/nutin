import { print } from '../utils/print.mjs';

export function printUpdateSummary({ toUpdate, toAdd, conflicts, unknown, removedByUser }) {
  print.section('\nSummary:');
  print.info(`  ${toUpdate.length} file(s) will be updated (untouched since generation)`);
  print.info(`  ${toAdd.length} new file(s) will be added`);
  if (conflicts.length > 0) {
    print.boldError(`  ${conflicts.length} file(s) you modified need manual attention`);
  }
  if (unknown.length > 0) {
    print.section(`  ${unknown.length} file(s) have no baseline to compare against — left untouched:`);
    unknown.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
  if (removedByUser.length > 0) {
    print.section(`  ${removedByUser.length} file(s) nutin used to generate but you removed — not recreated:`);
    removedByUser.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
}
