import { runCommand } from './run-command.js';

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
});
