import { print } from '../utils/print.mjs';

const describeValue = (value) => (value === undefined ? '(missing)' : JSON.stringify(value));

export function printUpdateSummary({ toUpdate, toAdd, conflicts, unknown, removedByUser, noLongerGenerated, jsonDrift = [] }) {
  print.section('\nSummary:');
  print.info(`  ${toUpdate.length} file(s) will be updated (untouched since generation)`);
  print.info(`  ${toAdd.length} new file(s) will be added`);
  if (conflicts.length > 0) {
    print.boldError(`  ${conflicts.length} file(s) you modified need manual attention`);
  }
  if (noLongerGenerated.length > 0) {
    print.boldError(`  ${noLongerGenerated.length} file(s) nutin no longer generates — left in place, review manually:`);
    noLongerGenerated.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
  if (unknown.length > 0) {
    print.section(`  ${unknown.length} file(s) have no baseline to compare against — left untouched:`);
    unknown.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
  if (removedByUser.length > 0) {
    print.section(`  ${removedByUser.length} file(s) nutin used to generate but you removed — not recreated:`);
    removedByUser.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
  if (jsonDrift.length > 0) {
    print.section(`  ${jsonDrift.length} package.json/tsconfig.json value(s) differ from what this nutin version generates — never changed automatically, apply by hand if wanted:`);
    jsonDrift.forEach(({ file, key, yours, nutin }) =>
      print.section(`    - ${file} ${key}: yours ${describeValue(yours)}, nutin ${describeValue(nutin)}`)
    );
  }
}
