import fs from 'fs';
import os from 'os';
import path from 'path';
import { addTags } from './add-tags.js';

describe('addTags', () => {
  let tmpDir;
  let filePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-add-tags-'));
    filePath = path.join(tmpDir, 'index.html');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('inserts the stylesheet before </head> and the script before </body>', async () => {
    const html = '<html><head><title>T</title></head><body></body></html>';

    const result = await addTags(html, filePath);

    expect(result).toBe(
      '<html><head><title>T</title><link rel="stylesheet" href="/main.css"></head><body><script type="module" src="/app/main.js"></script></body></html>'
    );
  });

  it('falls back to inserting the stylesheet before <title> when there is no </head>', async () => {
    const html = '<html><title>T</title><body></body></html>';

    const result = await addTags(html, filePath);

    expect(result).toBe(
      '<html><link rel="stylesheet" href="/main.css"><title>T</title><body><script type="module" src="/app/main.js"></script></body></html>'
    );
  });

  it('appends both tags to the end when neither anchor is present', async () => {
    const html = '<html></html>';

    const result = await addTags(html, filePath);

    expect(result).toBe(
      '<html></html><link rel="stylesheet" href="/main.css"><script type="module" src="/app/main.js"></script>'
    );
  });

  it('writes the modified html to filePath', async () => {
    const html = '<html><head></head><body></body></html>';

    const result = await addTags(html, filePath);

    expect(fs.readFileSync(filePath, 'utf8')).toBe(result);
  });
});
