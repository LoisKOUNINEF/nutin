import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';

const fs = fsExtra.default;

async function appendLineIfMissing(filePath, line) {
  if (!(await fs.pathExists(filePath))) {
    print.section(`⚠️  Skipped (not found): ${path.basename(filePath)}`);
    return false;
  }

  const content = await fs.readFile(filePath, 'utf8');
  if (content.includes(line)) {
    return false;
  }

  const separator = content.length === 0 || content.endsWith('\n') ? '' : '\n';
  await fs.writeFile(filePath, `${content}${separator}${line}\n`);
  print.info(`Updated ${path.basename(filePath)}`);
  return true;
}

async function ensureLibsUseInMainScss(mainScssPath) {
  if (!(await fs.pathExists(mainScssPath))) {
    return false;
  }

  const content = await fs.readFile(mainScssPath, 'utf8');
  if (content.includes('@use "../libs";')) {
    return true;
  }

  const block = '// libs - using partials to ensure proper stacking context\n@use "../libs";\n\n';
  const marker = '// global styles';
  const updated = content.includes(marker) ? content.replace(marker, `${block}${marker}`) : `${block}${content}`;

  await fs.writeFile(mainScssPath, updated);
  print.info(`Updated ${path.basename(mainScssPath)}`);
  return true;
}

export async function updateLibBarrels(projectPath, feature) {
  if (feature.tsExport) {
    await appendLineIfMissing(path.join(projectPath, 'src', 'libs', 'index.ts'), feature.tsExport);
  }
  if (feature.scssForward) {
    await appendLineIfMissing(path.join(projectPath, 'src', 'libs', '_index.scss'), feature.scssForward);
    await ensureLibsUseInMainScss(path.join(projectPath, 'src', 'styles', 'main.scss'));
  }
}
