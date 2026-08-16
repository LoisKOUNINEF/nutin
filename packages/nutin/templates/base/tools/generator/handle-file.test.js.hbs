import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateFile, appendToIndex, generateJson } from './handle-file.js';
import { LANGUAGES } from '../utils/languages.js';

describe('handle-file', () => {
  let tmpDir;
  let originalCwd;
  let exitSpy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-handle-file-'));
    originalCwd = process.cwd();
    exitSpy = spyOn(process, 'exit').andCallFake(() => {});
  });

  afterEach(() => {
    exitSpy.restore();
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generateFile writes the template output to <targetPath>/<name>.<suffix>.<extension>', () => {
    const targetPath = path.join(tmpDir, 'components', 'widget');
    const name = { kebab: 'widget', pascal: 'Widget', camel: 'widget', capitalized: 'Widget' };

    generateFile({ name, targetPath, templateFn: (n) => `content for ${n.kebab}`, suffix: 'component' });

    const filePath = path.join(targetPath, 'widget.component.ts');
    expect(fs.existsSync(filePath)).toBeTruthy();
    expect(fs.readFileSync(filePath, 'utf8')).toBe('content for widget');
    expect(exitSpy.callCount).toBe(0);
  });

  it('generateFile respects a custom extension', () => {
    const targetPath = path.join(tmpDir, 'services', 'widget');
    const name = { kebab: 'widget', pascal: 'Widget', camel: 'widget', capitalized: 'Widget' };

    generateFile({ name, targetPath, templateFn: () => 'x', suffix: 'service', extension: 'js' });

    expect(fs.existsSync(path.join(targetPath, 'widget.service.js'))).toBeTruthy();
  });

  it('generateFile calls process.exit(1) instead of overwriting an existing file', () => {
    const targetPath = path.join(tmpDir, 'components', 'widget');
    const name = { kebab: 'widget', pascal: 'Widget', camel: 'widget', capitalized: 'Widget' };
    const templateFn = () => 'fixed content';

    generateFile({ name, targetPath, templateFn, suffix: 'component' });
    // the second call hits the already-exists guard, which prints via console.error
    silenceConsole('error', () => generateFile({ name, targetPath, templateFn, suffix: 'component' }));

    expect(exitSpy.callCount).toBe(1);
    expect(exitSpy.lastCall).toEqual([1]);
  });

  it('appendToIndex appends an export line to the barrel three segments up from targetPath', () => {
    process.chdir(tmpDir);
    const basePath = path.join('src', 'app', 'components');
    fs.mkdirSync(basePath, { recursive: true });
    fs.writeFileSync(path.join(basePath, 'index.ts'), "export * from './existing.js';\n");

    const targetPath = path.join('src', 'app', 'components', 'widget');
    const name = { kebab: 'widget', pascal: 'Widget', camel: 'widget', capitalized: 'Widget' };

    // appendToIndex prints a "index.ts updated" log via console.info
    silenceConsole('info', () => appendToIndex({ name, targetPath, suffix: 'component' }));

    const indexContent = fs.readFileSync(path.join(basePath, 'index.ts'), 'utf8');
    expect(indexContent).toBe("export * from './existing.js';\nexport * from './widget/widget.component.js';\n");
  });

  it('generateJson writes one locale file per configured language for a non-view target', () => {
    const targetPath = path.join(tmpDir, 'components', 'widget');
    const name = { kebab: 'widget', pascal: 'Widget', camel: 'widget', capitalized: 'Widget' };

    generateJson({ targetPath, name });

    for (const lang of LANGUAGES) {
      const localeFile = path.join(targetPath, 'locales', `${lang}.json`);
      expect(fs.existsSync(localeFile)).toBeTruthy();
      expect(fs.readFileSync(localeFile, 'utf8')).toBe('{ "default": "Widget works !"}');
    }
  });

  it('generateJson uses the view template for a view target', () => {
    const targetPath = path.join(tmpDir, 'views', 'widget-view');
    const name = { kebab: 'widget-view', pascal: 'WidgetView', camel: 'widgetView', capitalized: 'Widget-View' };

    generateJson({ targetPath, name });

    const localeFile = path.join(targetPath, 'locales', `${LANGUAGES[0]}.json`);
    const content = fs.readFileSync(localeFile, 'utf8');
    expect(content).toContain('WidgetView works !');
    expect(content).not.toBe('{ "default": "WidgetView works !"}');
  });
});
