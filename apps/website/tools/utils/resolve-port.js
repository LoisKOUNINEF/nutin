export const DEFAULT_PORT = 9090;

// Precedence: --port flag > npm_config_port > PORT env > DEFAULT_PORT.
// npm_config_port covers older npm versions turning `npm run dev --port=3000`
// (no `--`) into config instead of argv; npm >= 11 rejects that with EUNKNOWNCONFIG.
export function resolvePort(argv = process.argv.slice(2), env = process.env) {
  const raw = readPortFlag(argv) ?? env.npm_config_port ?? env.PORT;
  if (raw === undefined || raw === '') return DEFAULT_PORT;

  const port = Number(raw);
  if (!/^\d+$/.test(String(raw)) || port < 1 || port > 65535) {
    throw new Error(`Invalid port "${raw}" — expected an integer between 1 and 65535.`);
  }
  return port;
}

function readPortFlag(argv) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--port=')) return arg.slice('--port='.length);
    if (arg === '--port') {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        throw new Error('Missing value for --port (e.g. --port 3000).');
      }
      return next;
    }
  }
  return undefined;
}
