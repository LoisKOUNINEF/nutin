import { runCommand, captureCommand } from './run-command.js';

describe('runCommand', () => {
  it('resolves when the child process exits with code 0', async () => {
    const result = await runCommand('node', ['-e', 'process.exitCode=0']);
    expect(result).toBe(undefined);
  });

  it('rejects with the exit code when the child process exits non-zero', async () => {
    let error;
    try {
      await runCommand('node', ['-e', 'process.exitCode=7']);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toContain('7');
  });

  it('passes arguments containing spaces through unsplit', async () => {
    await runCommand('node', ['-e', 'if (process.argv[1] !== "a b") process.exitCode = 1', 'a b']);
  });

  it('captureCommand resolves with the exit code and the collected stdout and stderr', async () => {
    const { code, output } = await captureCommand('node', ['-e', 'console.log("out"); console.error("err"); process.exitCode = 2']);
    expect(code).toBe(2);
    expect(output).toContain('out');
    expect(output).toContain('err');
  });
});
