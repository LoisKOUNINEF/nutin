import path from 'path';
import { fileURLToPath } from 'url';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';

const fs = fsExtra.default;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nutinConfigFileName = 'nutin.config.js';

async function getTestinNutinConfigBlock() {
  const templatePath = path.join(__dirname, '..', '..', '..', 'templates', 'base', `${nutinConfigFileName}.hbs`);
  const raw = await fs.readFile(templatePath, 'utf8');
  const startMarker = '{{#if testinNutin}}';
  const endMarker = '{{/if}}';
  const start = raw.indexOf(startMarker);
  const end = raw.indexOf(endMarker, start);

  if (start === -1 || end === -1) {
    return null;
  }

  return raw.slice(start + startMarker.length, end).trim();
}

export async function ensureTestinNutinConfigBlock(nutinConfigPath) {
  if (!(await fs.pathExists(nutinConfigPath))) {
    print.section(`⚠️  Skipped (not found): ${path.basename(nutinConfigPath)}`);
    return false;
  }

  const content = await fs.readFile(nutinConfigPath, 'utf8');
  if (content.includes('testinNutin:')) {
    return false;
  }

  const block = await getTestinNutinConfigBlock();
  if (!block) {
    return false;
  }

  const lastBraceIndex = content.lastIndexOf('}');
  const updated = `${content.slice(0, lastBraceIndex)}  ${block}\n${content.slice(lastBraceIndex)}`;

  await fs.writeFile(nutinConfigPath, updated);
  print.info(`Updated ${path.basename(nutinConfigPath)}`);
  return true;
}
