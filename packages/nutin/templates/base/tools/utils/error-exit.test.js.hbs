import { spawnSync } from 'child_process';

// errorExit() ends the process: each case runs in a child, and its stderr is checked.
const ERROR_EXIT = new URL('./error-exit.js', import.meta.url).href;

function run(throwExpression, env = {}) {
  const script = `import { errorExit, UserError } from ${JSON.stringify(ERROR_EXIT)}; errorExit(${throwExpression}, 'origin');`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', NUTIN_DEBUG: '', ...env },
  });
  return { status: result.status, stderr: result.stderr };
}

describe('errorExit', () => {
  it('prints a string or a UserError as its message only, and exits 1', () => {
    for (const expression of ['"bad config."', 'new UserError("bad config.")']) {
      const { status, stderr } = run(expression);
      expect(status).toBe(1);
      expect(stderr.trim()).toBe('origin - Error: bad config.');
    }
  });

  it('prints an unexpected Error with its stack, without repeating the message', () => {
    const { stderr } = run('new Error("boom")');
    expect(stderr).toContain('origin - Error: boom');
    expect(stderr).toContain('    at ');
    expect(stderr.split('boom').length).toBe(2);
  });

  it('prints every stack with NUTIN_DEBUG=1', () => {
    const { stderr } = run('new UserError("bad config.")', { NUTIN_DEBUG: '1' });
    expect(stderr).toContain('    at ');
  });

  it('leaves out the origin when there is none', () => {
    const script = `import { errorExit } from ${JSON.stringify(ERROR_EXIT)}; errorExit('nope.');`;
    const { stderr } = spawnSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf-8', env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } });
    expect(stderr.trim()).toBe('Error: nope.');
  });
});
