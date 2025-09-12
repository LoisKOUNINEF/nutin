import fs from 'fs';
import path from 'path';
import { print } from '../utils/index.js';

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

