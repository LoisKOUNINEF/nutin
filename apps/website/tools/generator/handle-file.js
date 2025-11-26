import fs from 'fs';
import path from 'path';
import { print, LANGUAGES } from '../utils/index.js';
import { jsonTemplate } from './templates/index.js';
import { scssTemplate } from './templates/index.js';

export function generateFile({
  name,
  targetPath,
  templateFn,
  suffix,
  extension = 'ts',
}) {
  fs.mkdirSync(targetPath, { recursive: true });
  const template = templateFn(name, targetPath);
  const filePath = `${targetPath}/${name.kebab}.${suffix}.${extension}`;

  if (fs.existsSync(filePath)) {
    print.boldError('A file with this name already exists');
    process.exit(1);
  }

  fs.writeFileSync(filePath, template);
}

export function appendToIndex({ name, targetPath, suffix }) {
  const absTargetPath = path.resolve(process.cwd(), targetPath);

  const parts = targetPath.split(path.sep);
  const basePath = parts.slice(0, 3).join(path.sep);

  const indexFilePath = path.join(basePath, 'index.ts');

  const absFilePath = path.join(absTargetPath, `${name.kebab}.${suffix}.js`);
  const relPath = path.relative(basePath, absFilePath).replace(/\\/g, '/');

  const lineToAppend = `export * from './${relPath}';\n`;

  try {
    fs.appendFileSync(indexFilePath, lineToAppend, 'utf8');
    print.info(`${suffix}s/index.ts updated.`);
  } catch (err) {
    print.error(`Error appending line: ${err}`);
  }
}

export function generateJson({ targetPath, name }) {
  const localesDir = `${targetPath}/locales`;
  fs.mkdirSync(localesDir, { recursive: true });

  const template = targetPath.includes('view') ? jsonTemplate(name) : `{ "default": "${name.pascal} works !"}`;

// include "meta" keys for views, empty JSON for components
  LANGUAGES.forEach((lang) => {
    fs.writeFileSync(`${localesDir}/${lang}.json`, template);
  });
}

export function generateStylesheet({ name, suffix }) {
  const template = scssTemplate();
  const stylesPath = path.join('src', 'styles', `${suffix}s`);
  const filePath = path.join(stylesPath, `_${name.kebab}.${suffix}.scss`);
  const indexPath = path.join(stylesPath, `_index.scss`);
  
  if (!fs.existsSync(stylesPath) || !fs.existsSync(indexPath)) {
    print.boldError('Non existing path');
    process.exit(1);
  }
  if (fs.existsSync(filePath)) {
    print.boldError('A file with this name already exists');
    process.exit(1);
  }

  fs.writeFileSync(filePath, template);

  const lineToAppend = `@forward "${name.kebab}.${suffix}";\n`;

  try {
    fs.appendFileSync(indexPath, lineToAppend, 'utf8');
  } catch (err) {
    print.error(`Error appending line: ${err}`);
  }
}

