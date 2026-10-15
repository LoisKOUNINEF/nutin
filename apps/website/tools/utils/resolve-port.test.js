import { resolvePort, DEFAULT_PORT } from './resolve-port.js';

describe('resolvePort', () => {
  it('defaults to 9090 with no flag or env', () => {
    expect(resolvePort([], {})).toBe(DEFAULT_PORT);
    expect(DEFAULT_PORT).toBe(9090);
  });

  it('reads --port <n>', () => {
    expect(resolvePort(['--port', '3000'], {})).toBe(3000);
  });

  it('reads --port=<n>', () => {
    expect(resolvePort(['--silent', '--port=3001'], {})).toBe(3001);
  });

  it('reads npm_config_port (npm rewrites --port into config)', () => {
    expect(resolvePort([], { npm_config_port: '3002' })).toBe(3002);
  });

  it('reads PORT', () => {
    expect(resolvePort([], { PORT: '3003' })).toBe(3003);
  });

  it('prefers --port over npm_config_port over PORT', () => {
    expect(resolvePort(['--port', '1111'], { npm_config_port: '2222', PORT: '3333' })).toBe(1111);
    expect(resolvePort([], { npm_config_port: '2222', PORT: '3333' })).toBe(2222);
  });

  it('ignores an empty PORT', () => {
    expect(resolvePort([], { PORT: '' })).toBe(DEFAULT_PORT);
  });

  it('throws on a non-numeric port', () => {
    expect(() => resolvePort(['--port', 'abc'], {})).toThrow('Invalid port "abc"');
  });

  it('throws on out-of-range ports', () => {
    expect(() => resolvePort(['--port=0'], {})).toThrow('Invalid port "0"');
    expect(() => resolvePort([], { PORT: '70000' })).toThrow('Invalid port "70000"');
  });

  it('throws when --port has no value', () => {
    expect(() => resolvePort(['--port'], {})).toThrow('Missing value for --port');
    expect(() => resolvePort(['--port', '--silent'], {})).toThrow('Missing value for --port');
  });
});
