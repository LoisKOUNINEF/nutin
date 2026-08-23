import fs from 'fs';
import os from 'os';
import path from 'path';
import { runScript } from './run-script.js';

describe('runScript', () => {
  let tmpDir;
  let exitSpy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-run-script-'));
    exitSpy = spyOn(process, 'exit').andCallFake(() => {});
  });

  afterEach(() => {
    exitSpy.restore();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('does not call process.exit when the script exits 0', () => {
    const scriptPath = path.join(tmpDir, 'ok.js');
    fs.writeFileSync(scriptPath, '// no-op, exits 0 by default\n');

    // runScript prints its status message via console.info as part of its real behavior
    silenceConsole('info', () => runScript(scriptPath, 'running ok script'));

    expect(exitSpy.callCount).toBe(0);
  });

  it('calls process.exit with the script status when it exits non-zero', () => {
    const scriptPath = path.join(tmpDir, 'fail.js');
    fs.writeFileSync(scriptPath, 'process.exitCode = 3;\n');

    // runScript prints its status message and a failure message via console.info/console.error
    silenceConsole(['info', 'error'], () => runScript(scriptPath, 'running failing script'));

    expect(exitSpy.callCount).toBe(1);
    expect(exitSpy.lastCall).toEqual([3]);
  });
});
